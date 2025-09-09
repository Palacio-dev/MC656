import dotenv from "dotenv"; dotenv.config();
import pkg from "pg"; const { Client } = pkg;

const client = new Client({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
await client.connect();
const r = await client.query("select 1 as ok");
console.log(r.rows);
await client.end();