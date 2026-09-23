import "reflect-metadata";
import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";

async function main() {
  await AppDataSource.initialize();
  console.log("Database connection established");

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
