import { ProductModel } from "../models/productModel.js"

export class ProductService {
  static getAllProducts() {
    return ProductModel.getAll()
  }

  static getProductById(id) {
    return ProductModel.getById(id)
  }
}
