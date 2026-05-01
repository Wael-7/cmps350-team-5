import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'bun ./prisma/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
