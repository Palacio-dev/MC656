import { useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  updateProfile,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  User,
  AuthError,
} from 'firebase/auth';
import { auth } from '../config/firebase';

type UseSettingsReturn = {
  user: User | null;
  loading: boolean;
  updateName: (name: string) => Promise<void>;
  updateEmail: (email: string, currentPassword?: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};

export default function useSettings(): UseSettingsReturn {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!mounted) return;
      if (!u) {
        setUser(null);
        return;
      }
      // ensure the latest profile fields are loaded
      try {
        await u.reload();
      } catch {
        // ignore reload errors
      }
      // use auth.currentUser after reload so displayName/email are fresh
      if (mounted) setUser(auth.currentUser);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const reauthenticateIfNeeded = useCallback(
    async (maybePassword?: string) => {
      const current = auth.currentUser;
      if (!current) throw new Error('Usuário não autenticado.');
      if (!maybePassword) throw new Error('Senha atual é necessária para esta operação.');

      const credential = EmailAuthProvider.credential(current.email || '', maybePassword);
      await reauthenticateWithCredential(current, credential);
    },
    []
  );

  const updateName = useCallback(async (name: string) => {
    const current = auth.currentUser;
    if (!current) throw new Error('Usuário não autenticado.');
    setLoading(true);
    try {

      if (current.displayName === name) throw new Error('Este já é o seu nome de usuário.');
      if (!name) throw new Error('O nome não pode ser vazio.');
      // Regex to allow only letters
      if (!/^[A-Za-z]+$/.test(name)) throw new Error('Nome inválido, por favor, não coloque caracteres especiais nem espaços!');


      await updateProfile(current, { displayName: name });
      // reload to ensure auth.currentUser has latest displayName
      try { await current.reload(); } catch {}
      setUser(auth.currentUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEmail = useCallback(async (email: string, currentPassword?: string) => {
    const current = auth.currentUser;
    if (!current) throw new Error('Usuário não autenticado.');
    setLoading(true);
    try {
      try {
        await fbUpdateEmail(current, email);
        try { await current.reload(); } catch {}
        setUser(auth.currentUser);
      } catch (err) {
        const e = err as AuthError;
        if (e.code === 'auth/requires-recent-login') {
          if (!currentPassword) throw new Error('Sessão expirada. Forneça a senha atual para confirmar.');
          await reauthenticateIfNeeded(currentPassword);
          await fbUpdateEmail(current, email);
          try { await current.reload(); } catch {}
          setUser(auth.currentUser);
        } else {
          throw err;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [reauthenticateIfNeeded]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const current = auth.currentUser;
    if (!current) throw new Error('Usuário não autenticado.');
    if (!currentPassword) throw new Error('Senha atual é necessária para alterar a senha.');
    setLoading(true);
    try {
      await reauthenticateIfNeeded(currentPassword);
      await fbUpdatePassword(current, newPassword);
      // reload if you rely on any server-provided user fields
      try { await current.reload(); } catch {}
      setUser(auth.currentUser);
    } finally {
      setLoading(false);
    }
  }, [reauthenticateIfNeeded]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  return {
    user,
    loading,
    updateName,
    updateEmail,
    updatePassword,
    logout,
  };
}