import React, { useState, useEffect, useRef } from 'react';
import {PageHeader} from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import '../styles/ProductSearch.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSettings();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // track whether user edited the name input to avoid clobbering on auth updates
  const nameTouchedRef = useRef(false);

  // populate name from auth user when available (but don't overwrite user edits)
  useEffect(() => {
    if (!settings?.user) return;
    if (!nameTouchedRef.current) setName(settings.user.displayName ?? '');
  }, [settings?.user]);

  useEffect(() => {
    // clear status when fields change
    setStatus(null);
  }, [name, currentPassword, newPassword, confirmPassword]);

  async function handleUpdateName(e?: React.FormEvent) {
    e?.preventDefault();
    setStatus(null);
    if (!settings?.updateName) return;
    try {
      await settings.updateName(name);
      setStatus({ type: 'success', msg: 'Nome atualizado.' });
      nameTouchedRef.current = false; // sync with server value
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error)?.message ?? 'Falha ao atualizar nome.' });
    }
  }

  async function handleChangePassword(e?: React.FormEvent) {
    e?.preventDefault();
    setStatus(null);
    if (!settings?.updatePassword) return;
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'A nova senha e confirmação não coincidem.' });
      return;
    }
    try {
      await settings.updatePassword(currentPassword, newPassword);
      setStatus({ type: 'success', msg: 'Senha alterada.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error)?.message ?? 'Falha ao alterar senha.' });
    }
  }

  async function handleLogout() {
    if (!settings?.logout) return;
    try {
      await settings.logout();
      navigate('/');
    } catch {
      setStatus({ type: 'error', msg: 'Falha ao sair.' });
    }
  }

  return (
    <div className="product-search-container">
      <PageHeader title="Configurações" subtitle="Gerencie sua conta" />

      <div className="product-search-content">
        <div className="product-details-card">
          <h3>Perfil</h3>
          <form onSubmit={handleUpdateName}>
            <label className="field-label">Nome</label>
            <input
              className="search-input"
              value={name}
              onChange={(e) => { nameTouchedRef.current = true; setName(e.target.value); }}
              placeholder="Nome completo"
            />
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={settings.loading}>Salvar nome</button>
            </div>
          </form>
        </div>

        <div className="product-details-card">
          <h3>Senha</h3>
          <form onSubmit={handleChangePassword}>
            <label className="field-label">Senha atual</label>
            <input
              className="search-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Senha atual"
            />
            <label className="field-label" style={{ marginTop: 8 }}>Nova senha</label>
            <input
              className="search-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova senha"
            />
            <label className="field-label" style={{ marginTop: 8 }}>Confirmar nova senha</label>
            <input
              className="search-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={settings.loading}>Alterar senha</button>
            </div>
          </form>
        </div>

        <div className="product-details-card">
          <h3>Conta</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={handleLogout} disabled={settings.loading}>Logout</button>
            <button className="btn" onClick={() => navigate(-1)}>Cancelar</button>
          </div>
        </div>

        {status && (
          <div className={`toast ${status.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ marginTop: 8 }}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;