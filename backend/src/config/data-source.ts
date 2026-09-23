import "reflect-metadata";
import dns from "node:dns";
import net from "node:net";
import { DataSource } from "typeorm";
import { neonConfig } from "@neondatabase/serverless";
import * as neon from "@neondatabase/serverless";
import ws from "ws";
import { Clinician } from "../entities/Clinician";
import { Patient } from "../entities/Patient";
import { Visit } from "../entities/Visit";
import { env } from "./env";

// Docker Desktop advertises IPv6 but cannot route it. Disable Happy Eyeballs
// so a broken AAAA lookup cannot stall (or fail) the IPv4 path to Neon.
dns.setDefaultResultOrder("ipv4first");
if (typeof net.setDefaultAutoSelectFamily === "function") {
  net.setDefaultAutoSelectFamily(false);
}

// Neon serverless driver talks over WebSockets on 443 instead of TCP 5432.
// That avoids Docker Desktop's unroutable IPv6 + outbound-5432 timeouts.
neonConfig.webSocketConstructor = ws;

// synchronize is intentionally OFF, even in dev - schema changes go through
// migrations so the migration history is the single source of truth for the
// schema (and so `npm run migration:run` is a faithful way to set up a fresh
// database, per the take-home's Docker/local-setup requirement).
export const AppDataSource = new DataSource({
  type: "postgres",
  driver: neon,
  url: env.databaseUrl,
  ssl: true,
  extra: {
    connectionTimeoutMillis: 20_000,
  },
  synchronize: false,
  logging: env.nodeEnv === "development" ? ["error", "warn"] : false,
  entities: [Clinician, Patient, Visit],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
});
