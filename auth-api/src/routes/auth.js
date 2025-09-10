import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_EXPIRES = "7d";
const normalizeEmail = (e) => (e || "").trim().toLowerCase();


router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
    if (password.length < 8) return res.status(400).json({ error: "Password too short" });

    const hash = await bcrypt.hash(password, 12);
    const emailNorm = normalizeEmail(email);

    const q = `INSERT INTO users (name, email, password_hash)
              VALUES ($1, $2, $3)
              RETURNING id, name, email`;
    const { rows } = await pool.query(q, [name, emailNorm, hash]);
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email already registered" });
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const emailNorm = normalizeEmail(email);
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [emailNorm]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// verify if requested email is already registered
router.get("/check-email", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Informe o e-mail" });

    const { rows } = await pool.query("SELECT 1 FROM public.users WHERE email=$1", [email.toLowerCase()]);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error("CHECK-EMAIL ERROR:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
