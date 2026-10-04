import { products } from "../data/products.js"

export class ProductModel {
  static getAll() {
    return products
  }

  static getById(id) {
    return products.find((product) => product.id === id) || null
  }
}
