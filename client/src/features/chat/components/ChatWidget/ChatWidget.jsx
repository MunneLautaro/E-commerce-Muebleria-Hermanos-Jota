import { useEffect, useRef, useState } from "react"
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
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([initialMessage])
  const [sessionId] = useState(createSessionId)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [isOpen, messages, isSending])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || isSending) return

    setInput("")
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8 8.5 8.5 0 01-3.5-.75L4 20l.75-3.5A8.5 8.5 0 014 12a8 8 0 018-8 8 8 0 018 8z" />
        </svg>
      </button>
    )
  }

  return (
    <section className={s.panel} aria-label="Asistente de Hermanos Jota">
      <header className={s.header}>
        <h2 className={s.title}>Asistente Hermanos Jota</h2>
        <button type="button" className={s.close} onClick={() => setIsOpen(false)} aria-label="Cerrar asistente">
          <span aria-hidden="true" className="text-xl leading-none">×</span>
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

      <form className={s.form} onSubmit={handleSubmit}>
        <label htmlFor="chat-message" className="sr-only">Escribí tu mensaje</label>
        <textarea
          id="chat-message"
          className={s.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribí tu consulta..."
          rows="2"
          maxLength="2000"
          disabled={isSending}
        />
        <button type="submit" className={s.submit} disabled={isSending || !input.trim()}>
          {isSending ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </section>
  )
}
