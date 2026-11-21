import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    globalSetup: ["./tests/globalSetup.js"],
    setupFiles:["./tests/setup.js"],
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-jwt-secret",
      JWT_EXPIRES_IN: "1h",
      GOOGLE_CLIENT_ID: "test-google-client-id.apps.googleusercontent.com",
      CORS_WHITELIST: "http://localhost:5173",
    },
    hookTimeout: 120000,
    testTimeout: 15000,
  },
})
