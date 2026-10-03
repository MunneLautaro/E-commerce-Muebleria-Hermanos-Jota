import { ContactForm } from "../../features/contacto/components/Form/ContactForm"
import { datosContacto } from "../../datos/contacto"

const contactLinks = [
  {
    label: "Escribinos por email",
    value: datosContacto.email,
    href: `mailto:${datosContacto.email}`,
  },
  {
    label: "Hablemos por WhatsApp",
    value: datosContacto.telefono,
    href: "https://wa.me/541145678900",
  },
]

export default function ContactPage() {
  return (
    <div className="space-y-16 py-4 md:space-y-20 md:py-8">
      <header className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl space-y-5">
          <p className="font-medium text-sm uppercase tracking-cta text-salvia">
            Estamos para ayudarte
          </p>
          <h1>Hablemos de tu próximo mueble</h1>
          <p className="max-w-xl text-lg leading-[1.7] text-ink-soft">
            Cada espacio tiene una historia. Contanos qué estás imaginando y
            pensamos juntos una pieza que te acompañe durante muchos años.
          </p>
        </div>
        <p className="max-w-xs border-l-4 border-oro pl-5 font-display text-xl italic leading-[1.45] text-siena">
          Diseñamos con tiempo, escuchamos con atención.
        </p>
      </header>

      <section
        className="grid overflow-hidden rounded-marca border border-linea bg-crema shadow-marca lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]"
        aria-label="Formulario y datos de contacto"
      >
        <div className="bg-white p-6 sm:p-10 lg:p-14">
          <div className="mb-8 space-y-3">
            <h2>Dejanos tu consulta</h2>
            <p className="max-w-xl text-ink-soft">
              Respondemos personalmente de lunes a viernes. Los campos
              marcados como opcionales pueden quedar vacíos.
            </p>
          </div>
          <ContactForm />
        </div>

        <aside className="flex flex-col justify-between gap-10 border-t border-linea bg-panel-marca p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="font-medium text-sm uppercase tracking-cta text-salvia">
                Visitanos
              </p>
              <h2 className="text-2xl">Casa Taller</h2>
              <address className="not-italic leading-[1.7] text-ink-soft">
                <p>{datosContacto.showroom}</p>
                <p className="mt-2">{datosContacto.horario}</p>
              </address>
              <a
                className="inline-flex pt-2 font-medium text-sm uppercase tracking-cta text-siena hover:text-ink"
                href="https://www.google.com/maps/search/?api=1&query=Av.+San+Juan+2847,+CABA"
                target="_blank"
                rel="noreferrer"
              >
                Cómo llegar <span aria-hidden="true" className="ml-2">↗</span>
              </a>
            </div>

            <div className="h-px bg-linea" aria-hidden="true" />

            <div className="space-y-4">
              <p className="font-medium text-sm uppercase tracking-cta text-salvia">
                Canales directos
              </p>
              <ul className="space-y-4">
                {contactLinks.map(({ label, value, href }) => (
                  <li key={href}>
                    <a
                      className="group flex flex-col gap-1 text-ink-soft transition-colors hover:text-siena"
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      <span className="text-xs uppercase tracking-caption text-ink-soft">
                        {label}
                      </span>
                      <span className="font-medium">{value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="border-l-4 border-salvia bg-panel-salvia px-5 py-4 text-sm leading-[1.6] text-ink-soft">
            Si preferís, también podés acercarte al showroom para ver las
            texturas y terminaciones en persona.
          </p>
        </aside>
      </section>
    </div>
  )
}