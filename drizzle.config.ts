import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv';

config({ path: '.env' });
export default defineConfig({
  schema: "./utils/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
