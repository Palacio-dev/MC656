import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // usa .env na raiz do auth-api

import authRouter from "./routes/auth.js"; // repare no .js no final!

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());

// rotas de auth
app.use("/api", authRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
