import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'npx tsx ./prisma/seed.js',
  },
  datasource: {
    url: 'file:./prisma/dev.db',
  },
})
