import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  validateEmail,
  checkEmailAvailability,
  signupUser,
  loginUser,
} from '../services/authService';
import {
  ROUTES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants/api';

// Model types
export interface LoginFormData {
  name: string;
  email: string;
  password: string;
}

export type AuthAction = 'Login' | 'Sign Up';


export function useLoginSignUp() {
  const navigate = useNavigate();
  
  // Local state
  const [action, setAction] = useState<AuthAction>('Login');
  const [form, setForm] = useState<LoginFormData>({ 
    name: '', 
    email: '', 
    password: '' 
  });
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Sync error to message
  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  // Generic async executor - handles loading and error states
  // Wrapped in useCallback to prevent recreating on every render
  const executeAsync = useCallback(async <R,>(asyncFunction: () => Promise<R>): Promise<R | null> => {
    setLoading(true);
    setError('');
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - uses setState which is stable

  // Update a specific form field
  const updateForm = useCallback((field: keyof LoginFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle signup flow
  const performSignup = useCallback(async (): Promise<void> => {
    if (loading) return;
    setMessage('');

    // Validation
    if (!validateEmail(form.email)) {
      setMessage(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    // Execute signup
    const result = await executeAsync(async () => {
      const isAvailable = await checkEmailAvailability(form.email);
      
      if (!isAvailable) {
        throw new Error(ERROR_MESSAGES.EMAIL_EXISTS);
      }
      
      await signupUser(form);
      return true;
    });

    // Handle success
    if (result) {
      setMessage(SUCCESS_MESSAGES.ACCOUNT_CREATED);
      setAction('Login');
      setForm(prev => ({ name: '', email: prev.email, password: '' }));
    }
  }, [loading, form, executeAsync]);

  // Handle login flow
  const performLogin = useCallback(async (): Promise<void> => {
    if (loading) return;
    setMessage('');

    const token = await executeAsync(async () => {
      return await loginUser(form.email, form.password);
    });

    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      setMessage(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      navigate(ROUTES.WELCOME);
    }
  }, [loading, form.email, form.password, executeAsync, navigate]);

  // Main submit handler - delegates to appropriate flow
  const handleSubmit = useCallback(async (): Promise<void> => {
    if (action === 'Sign Up') {
      await performSignup();
    } else {
      await performLogin();
    }
  }, [action, performSignup, performLogin]);

  // Computed properties
  const isSignUpMode = action === 'Sign Up';
  const submitButtonText = loading 
    ? (isSignUpMode ? 'Criando...' : 'Entrando...') 
    : (isSignUpMode ? 'Criar conta' : 'Entrar');

  // Return interface
  return {
    // State
    action,
    form,
    message,
    loading,
    
    // Actions
    setAction,
    updateForm,
    handleSubmit,
    
    // Computed
    isSignUpMode,
    submitButtonText,
  };
}
