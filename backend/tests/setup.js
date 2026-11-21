import { afterAll, afterEach, beforeAll, inject, vi } from "vitest"
import mongoose from "mongoose"
import { connectDB } from "../src/db.js"

vi.mock("../src/middlewares/rateLimit.js", () => {
  const passThrough = (req, res, next) => next()
  return {
    authRateLimit: passThrough,
    chatRateLimit: passThrough,
    contactRateLimit: passThrough,
    productWriteRateLimit: passThrough,
  }
})

vi.spyOn(console, "log").mockImplementation(() => {})

beforeAll(async () => {
  const baseUri = inject("mongoUri").replace(/\/$/, "")
  process.env.MONGODB_URI = `${baseUri}/hj-test-${process.env.VITEST_POOL_ID ?? "1"}`

  await connectDB()
})

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return
  const collections = await mongoose.connection.db.collections()
  await Promise.all(collections.map((collection) => collection.deleteMany({})))
})

afterAll(async () => {
  await mongoose.disconnect()
  if (global.mongooseCache) {
    global.mongooseCache.conn = null
    global.mongooseCache.promise = null
  }
})
