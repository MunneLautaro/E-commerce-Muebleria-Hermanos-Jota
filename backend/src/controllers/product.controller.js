import {
  createProductService,
  getProductsService,
  getAdminProductsService,
  getProductByIdService,
  getAdminProductByIdService,
  deleteProductService,
  updateProductService,
} from "../services/product.service.js"

export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body)
    return res.status(201).json(product)
  } catch (error) {
    return next(error)
  }
}

export const getProducts = async (req, res, next) => {
  try {
    const products = await getProductsService(req.validatedQuery)
    return res.json(products)
  } catch (error) {
    return next(error)
  }
}

export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await getAdminProductsService(req.validatedQuery)
    return res.json(products)
  } catch (error) {
    return next(error)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await getProductByIdService(id)

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    return res.json(product)
  } catch (error) {
    return next(error)
  }
}

export const getAdminProductById = async (req, res, next) => {
  try {
    const product = await getAdminProductByIdService(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    return res.json(product)
  } catch (error) {
    return next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const product = await updateProductService(req.params.id, req.body)

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    return res.json(product)
  } catch (error) {
    return next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await deleteProductService(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    return res.json(product)
  } catch (error) {
    return next(error)
  }
}
