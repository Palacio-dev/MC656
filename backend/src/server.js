import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRouter from "./routes/auth.js";
import { initDb } from "./db.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api", authRouter);

const port = process.env.PORT || 4000;

(async () => {
  try {
    await initDb();
    app.listen(port, () => console.log(`API on http://localhost:${port}`));
  } catch (err) {
    console.error("Falha ao iniciar servidor:", err);
    process.exit(1);
  }
})();
