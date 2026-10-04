import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { ProductList } from "../../features/products/components/ProductList/ProductList"
import { fetchApi } from "../../services/api"
import { homeStyles } from "./HomeStyles"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await fetchApi("/productos")

        const sortedProducts = [...products].sort(
          (a, b) => (b.vendidos ?? 0) - (a.vendidos ?? 0),
        )

        setFeaturedProducts(sortedProducts.slice(0, 4))
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los productos destacados.")
        toast.error("No se pudieron cargar los productos destacados.")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <main className={homeStyles.loadingContainer}>
        <p className={homeStyles.loadingText}>Cargando productos destacados...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className={homeStyles.errorContainer}>
        <p className={homeStyles.errorText}>{error}</p>
      </main>
    )
  }

  return (
    <main className={homeStyles.container}>
      <section className={homeStyles.heroSection}>
        <div className={homeStyles.heroContent}>
          <div className={homeStyles.heroCopy}>
            <p className={homeStyles.subtitle}>Diseños que perduran</p>
            <h1 className={homeStyles.title}>Hermanos Jota</h1>
            <p className={homeStyles.heroDescription}>
              Muebles honestos, funcionales y hechos para acompañar tu vida.
              Diseñamos cada pieza para que tu casa se sienta más tuya.
            </p>
            <div className={homeStyles.heroActions}>
              <Link to="/productos" className={homeStyles.primaryButton}>
                Ver colección
              </Link>
              <Link to="/contacto" className={homeStyles.secondaryButton}>
                Hablemos de tu espacio
              </Link>
            </div>
          </div>
          <div className={homeStyles.heroPanel}>
            <span className={homeStyles.heroPanelLabel}>Desde 1998</span>
            <p className={homeStyles.heroPanelText}>
              Oficio, materiales nobles y una mirada contemporánea.
            </p>
            <span className={homeStyles.heroPanelDetail}>Hecho en Buenos Aires</span>
          </div>
        </div>
        <div className={homeStyles.heroStats}>
          <div><strong className={homeStyles.statNumber}>25+</strong><span className={homeStyles.statLabel}>años creando</span></div>
          <div><strong className={homeStyles.statNumber}>100%</strong><span className={homeStyles.statLabel}>producción local</span></div>
          <div><strong className={homeStyles.statNumber}>1 a 1</strong><span className={homeStyles.statLabel}>atención personalizada</span></div>
        </div>
      </section>

      <section className={homeStyles.introSection}>
        <div>
          <p className={homeStyles.eyebrow}>Nuestra forma de hacer</p>
          <h2 className={homeStyles.introTitle}>Lo simple también puede ser extraordinario.</h2>
        </div>
        <p className={homeStyles.introText}>
          Seleccionamos maderas certificadas, trabajamos con artesanos locales y
          cuidamos cada terminación. El resultado son piezas que envejecen bien
          y se disfrutan durante mucho tiempo.
        </p>
      </section>

      <section className={homeStyles.valuesSection} aria-label="Beneficios">
        <article className={homeStyles.valueCard}><span className={homeStyles.valueNumber}>01</span><h3 className={homeStyles.valueTitle}>Materiales nobles</h3><p>Texturas reales y acabados naturales que mejoran con el tiempo.</p></article>
        <article className={homeStyles.valueCard}><span className={homeStyles.valueNumber}>02</span><h3 className={homeStyles.valueTitle}>Diseño pensado</h3><p>Proporciones cómodas y detalles que hacen más simple tu día a día.</p></article>
        <article className={homeStyles.valueCard}><span className={homeStyles.valueNumber}>03</span><h3 className={homeStyles.valueTitle}>Cerca tuyo</h3><p>Te acompañamos desde la elección hasta que el mueble llega a tu casa.</p></article>
      </section>

      <section className={homeStyles.categoriesSection}>
        <div className={homeStyles.sectionHeader}>
          <div><p className={homeStyles.eyebrow}>Encontrá tu próxima pieza</p><h2 className={homeStyles.sectionTitle}>Para cada rincón</h2></div>
          <Link to="/productos" className={homeStyles.viewAllLink}>Ver todos los productos →</Link>
        </div>
        <div className={homeStyles.categoriesGrid}>
          <Link to="/productos" className={`${homeStyles.categoryCard} ${homeStyles.categoryLiving}`}><span className={homeStyles.categoryTitle}>Living</span><small className={homeStyles.categoryCaption}>Calma para compartir</small></Link>
          <Link to="/productos" className={`${homeStyles.categoryCard} ${homeStyles.categoryWork}`}><span className={homeStyles.categoryTitle}>Trabajo</span><small className={homeStyles.categoryCaption}>Ideas que toman forma</small></Link>
          <Link to="/productos" className={`${homeStyles.categoryCard} ${homeStyles.categoryDining}`}><span className={homeStyles.categoryTitle}>Comedor</span><small className={homeStyles.categoryCaption}>Momentos alrededor de la mesa</small></Link>
        </div>
      </section>

      <section className={homeStyles.productsSection}>
        <div className={homeStyles.sectionHeader}>
          <div><p className={homeStyles.eyebrow}>Los más elegidos</p><h2 className={homeStyles.sectionTitle}>Productos destacados</h2></div>
          <Link to="/productos" className={homeStyles.viewAllLink}>Explorar colección →</Link>
        </div>

        <ProductList products={featuredProducts} compact />
      </section>

      <section className={homeStyles.contactCta}>
        <div><p className={homeStyles.eyebrow}>¿Tenés un proyecto en mente?</p><h2 className={homeStyles.ctaTitle}>Hagámoslo realidad.</h2></div>
        <Link to="/contacto" className={homeStyles.ctaButton}>Contactanos</Link>
      </section>
    </main>
  )
}
