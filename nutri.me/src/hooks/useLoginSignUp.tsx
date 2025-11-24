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
    setMessage("Conta criada com sucesso! Você já pode fazer login.");

    try {
      if (isSignUpMode) {
        // Validação do nome: apenas letras, números e underscore, sem espaços
        const nameRegex = /^[A-Za-z0-9_~]+$/;
        if (form.name == ""){
          throw new Error("Por favor, preencha o campo nome");
        }
        if (form.email == ""){
          throw new Error("Por favor, preencha o campo email");
        }
        if (form.password == ""){
          throw new Error("Por favor, preencha o campo senha");
        }
        if (!nameRegex.test(form.name)) {
          throw new Error("Nome inválido, por favor, não coloque caracteres especiais nem espaços!");
        }
        // Validação da senha
        // - Entre 6 e 20 caracteres
        // - Pelo menos uma letra maiúscula
        // - Pelo menos um número
        // - Pelo menos um caractere especial
        const password = form.password;
        const lengthValid = password.length >= 6 && password.length <= 20;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
        if (!(lengthValid && hasUppercase && hasNumber && hasSpecialChar)) {
          throw new Error("Senha inválida");
        }

        await AuthModel.signUp(form.email, form.password);
        setMessage("Conta criada com sucesso! Você já pode fazer login.");
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
