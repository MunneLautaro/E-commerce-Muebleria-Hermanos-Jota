import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { MessageCircle, X } from "lucide-react"
import { sendChatMessage } from "../../services/chatService"
import { chatWidgetStyles as s } from "./ChatWidgetStyles"

const initialMessage = {
  id: "welcome",
  role: "assistant",
  content: "¡Hola! ¿En qué puedo ayudarte con nuestros productos?",
}

function createSessionId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([initialMessage])
  const [sessionId] = useState(createSessionId)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { message: "" },
  })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [isOpen, messages, isSending])

  const handleSend = async ({ message: rawMessage }) => {
    const message = rawMessage.trim()
    if (!message || isSending) return

    reset()
    setError("")
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", content: message },
    ])
    setIsSending(true)

    try {
      const response = await sendChatMessage(message, sessionId)
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.message,
        },
      ])
    } catch (requestError) {
      setError(requestError.message || "No pudimos conectar con el chatbot.")
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className={s.launcher}
        onClick={() => setIsOpen(true)}
        aria-label="Abrir asistente de Hermanos Jota"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </button>
    )
  }

  return (
    <section className={s.panel} aria-label="Asistente de Hermanos Jota">
      <header className={s.header}>
        <h2 className={s.title}>Asistente Hermanos Jota</h2>
        <button type="button" className={s.close} onClick={() => setIsOpen(false)} aria-label="Cerrar asistente">
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <div className={s.messages} aria-live="polite">
        {messages.map(({ id, role, content }) => (
          <p key={id} className={`${s.message} ${role === "user" ? s.userMessage : s.assistantMessage}`}>
            {content}
          </p>
        ))}
        {isSending && <p className={s.typing}>El asistente está escribiendo...</p>}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className={s.error} role="alert">{error}</p>}

      <form className={s.form} onSubmit={handleSubmit(handleSend)}>
        <label htmlFor="chat-message" className="sr-only">Escribí tu mensaje</label>
        <textarea
          id="chat-message"
          className={s.input}
          {...register("message", { required: true, maxLength: 2000 })}
          placeholder="Escribí tu consulta..."
          rows="2"
          maxLength="2000"
          disabled={isSending}
        />
        <button type="submit" className={s.submit} disabled={isSending}>
          {isSending ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </section>
  )
}
