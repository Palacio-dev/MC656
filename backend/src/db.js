import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import pkg from "pg";
const { Pool, Client } = pkg;

export const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readAuthSql() {
  const candidate = path.join(process.cwd(), "authdb");

  try {
    if (!fs.existsSync(candidate)) return "";
    let sql = fs.readFileSync(candidate, "utf8");
    return sql ?? "";
  } catch (e) {
    console.warn("⚠ Não consegui ler 'authdb':", e.message);
    return "";
  }
}

async function ensureDatabaseExists() {
  const host = process.env.PGHOST || "localhost";
  const port = Number(process.env.PGPORT || 5432);
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const appDb = process.env.PGDATABASE;

  if (!appDb) throw new Error("PGDATABASE não definido no .env");

  const admin = new Client({
    host, port, user, password, database: "postgres",
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
  });

    await admin.connect();
  try {
    const check = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [appDb]);
    if (check.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${appDb}"`);
      console.log(`✔ Database "${appDb}" criado`);
    } else {
      console.log(`✔ Database "${appDb}" já existe`);
    }
  } finally {
    await admin.end();
  }
}


async function applySchema() {
  const raw = readAuthSql();
  const sql = typeof raw === "string" ? raw : "";
  const trimmed = sql.trim();

  if (!trimmed) {
    console.log("ℹ Sem arquivo 'authdb' (ou vazio); pulando schema.");
    return;
  }

  await pool.query("BEGIN");
  try {
    await pool.query(trimmed);
    await pool.query("COMMIT");
    console.log("✔ Schema inicial aplicado (arquivo 'authdb').");
  } catch (err) {
    await pool.query("ROLLBACK");
    if ((err.message || "").includes("already exists")) {
      console.log("ℹ Schema já estava aplicado.");
    } else {
      console.error("✖ Erro aplicando schema inicial:", err.message);
      throw err;
    }
  }
}


export async function initDb() {
  await ensureDatabaseExists();
  await applySchema();
}