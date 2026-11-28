import { MongoMemoryReplSet } from "mongodb-memory-server"

// Un único servidor de MongoDB para toda la corrida, levantado en el proceso
// principal de Vitest. Si cada worker arrancara y matara su propio mongod,
// en Windows el worker puede caerse al terminar (exit code 3221226505).
export default async function setup({ provide }) {
  const mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  })
  provide("mongoUri", mongoServer.getUri())

  return async () => {
    await mongoServer.stop()
  }
}
