import { betterAuth } from 'better-auth'
import { pool } from './db.js'

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // The Vite dev server (pinned to 5176) proxies to this backend, so the
  // browser's Origin header won't match baseURL even though this process runs elsewhere.
  trustedOrigins: ['http://localhost:5176'],
  emailAndPassword: {
    enabled: true,
  },
})
