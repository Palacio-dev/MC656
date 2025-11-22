import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseAuthModel } from "../models/firebaseAuthModel";
import { sendEmailVerification } from "firebase/auth";


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
        const userCredential = await AuthModel.signUp(form.email, form.password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
        }
        setMessage("Conta criada com sucesso! Um email de verificação foi enviado para seu email.");
        setAction("Login");

      } else {
        const userCredential = await AuthModel.login(form.email, form.password);
        if (userCredential.user.emailVerified) {
          navigate("/Welcome");
        } else {
          setMessage("Por favor, verifique seu email antes de fazer login.");
        }
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
