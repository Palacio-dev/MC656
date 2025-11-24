import React, { useState } from "react";
import { recoverPassword } from "../services/authService";
import { Link } from "react-router-dom";
import "../styles/RecoverPassword.css";

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      await recoverPassword(email);
      setStatus("Se enviado: verifique seu e-mail para instruções de recuperação.");
    } catch (err: any) {
      console.error(err);
      setError("Erro ao solicitar recuperação. Verifique o e-mail e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recover-container">
      <div className="recover-card" role="main" aria-labelledby="recover-title">
        <div className="recover-brand">
          <div className="recover-logo" aria-hidden>
            {/* simple envelope icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8.5L12 13l9-4.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#2563EB" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 id="recover-title" className="recover-title">Recuperar senha</h2>
          <p className="recover-subtitle">Digite seu e-mail e enviaremos um link para redefinir a senha.</p>
        </div>

        <form className="recover-form" onSubmit={onSubmit}>
          <label className="input-label" htmlFor="email">E‑mail</label>
          <div className="input-group">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3 8.5L12 13l9-4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5"/>
            </svg>
            <input
              id="email"
              className="input-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@exemplo.com"
              required
              aria-required
            />
          </div>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" aria-hidden /> : "Enviar link de recuperação"}
          </button>

          {status && <div className="status status-success" role="status">{status}</div>}
          {error && <div className="status status-error" role="alert">{error}</div>}

          <div className="recover-footer">
            <Link to="/login" className="link">Voltar ao login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;