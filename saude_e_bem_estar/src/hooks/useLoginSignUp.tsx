import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseAuthModel } from "../models/firebaseAuthModel";

// Model types
type FormState = {
  name: string;
  email: string;
  password: string;
};

type AuthAction = "Login" | "Sign Up";


export function useLoginSignUp() {
  const [form, setForm] = useState<FormState>({ 
    name: "", 
    email: "", 
    password: "",
  });
  const [action, setAction] = useState<AuthAction>('Login');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isSignUpMode = action === "Sign Up";
  const submitButtonText = isSignUpMode ? "Cadastrar" : "Entrar";
  const AuthModel = new FirebaseAuthModel();

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (isSignUpMode) {
        await AuthModel.signUp(form.email, form.password);
        setMessage("Conta criada com sucesso! Você já pode fazer login.");
        setAction("Login");

      } else {
        await AuthModel.login(form.email, form.password);
        navigate("/Welcome");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      await AuthModel.loginWithGoogle();
      navigate("/Welcome");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Erro ao autenticar com Google.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    action,
    setAction,
    isSignUpMode,
    updateForm,
    handleSubmit,
    handleGoogleLogin,
    loading,
    message,
    submitButtonText,
  };
}
