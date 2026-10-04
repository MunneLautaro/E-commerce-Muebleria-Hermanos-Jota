import {
  getProductsService,
  getProductByIdService,
} from "../services/product.service.js"

export const getProducts = async (req, res) => {
  try {
    const products = await getProductsService()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" })
  }
}

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const product = await getProductByIdService(id)

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    res.json(product)
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Error al obtener el producto" })
  }
}
