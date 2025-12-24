import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Force le chargement du .env à la racine du service (identity-service/.env)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
