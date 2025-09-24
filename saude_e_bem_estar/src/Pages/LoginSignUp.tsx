import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import validator from 'validator';
import '../Styles/LoginSignUp.css';
//import user_icon from "@/assets/imgs/user.png";
//import email_icon from '@/assets/imgs/email.png';
//import password_icon from '@/assets/imgs/password.png';

// Tipos para o formulário
interface FormData {
    name: string;
    email: string;
    password: string;
}

// Tipos para as respostas da API
interface ApiResponse {
    error?: string;
    token?: string;
    exists?: boolean;
}

// Tipo para as ações possíveis
type ActionType = 'Login' | 'Sign Up';

const LoginSignUp: React.FC = () => {
    
    const navigate = useNavigate();
    const [action, setAction] = useState<ActionType>('Login');
    const [form, setForm] = useState<FormData>({ name: '', email: '', password: '' });
    const [msg, setMsg] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    async function handleSignup(): Promise<void> {
        if (loading) return;
        setMsg('');

        if (!validator.isEmail(form.email)) {
            return setMsg("E-mail inválido.");
        }

        try {
            // availability check
            const rCheck = await fetch(`/api/check-email?email=${encodeURIComponent(form.email)}`);
            const dCheck: ApiResponse = await rCheck.json();
            if (dCheck.exists) {
                return setMsg('Este e-mail já está registrado.');
            }
        } catch (err) {
            return setMsg('Erro ao verificar e-mail.');
        }

        try {
            setLoading(true);
            const r = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data: ApiResponse = await r.json();
            if (!r.ok) throw new Error(data?.error || 'Erro no cadastro');
            setMsg('Conta criada! Faça login.');
            setAction('Login');
            setForm(f => ({ name: '', email: f.email, password: '' }));
        } catch (err) {
            setMsg(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin(): Promise<void> {
        if (loading) return;
        setMsg('');

        try {
            setLoading(true);
            const r = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const data: ApiResponse = await r.json();
            if (!r.ok) throw new Error(data?.error || 'Erro no login');
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                setMsg('Login OK'); /* successfully logged*/
                navigate("/Welcome");
            }
        } catch (err) {
            setMsg(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }

    // decide which handler to call
    //function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    //    e.preventDefault();
    //    if (action === 'Sign Up') handleSignup();
    //    else handleLogin();
    //}

    const handleButtonClick = (): void => {
        if (action === 'Sign Up') handleSignup();
        else handleLogin();
    };

    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>{action}</div>
                <div className='underline'></div>
            </div>

            {/* sign up and login buttons */}
            <div className="mode-switch">
                <button
                    type="button"
                    className={action === 'Login' ? 'toggle gray' : 'toggle'}
                    onClick={() => setAction('Sign Up')}
                >
                    Sign Up
                </button>
                <button
                    type="button"
                    className={action === 'Sign Up' ? 'toggle gray' : 'toggle'}
                    onClick={() => setAction('Login')}
                >
                    Login
                </button>
            </div>

            {/* input boxes */}
            <div className='inputs'>
                {action === "Sign Up" && (
                    <div className='input'>
                        {/*<img src={user_icon} alt="user_icon" />*/}
                        <input 
                            name="name" 
                            type="text" 
                            placeholder='Name' 
                            value={form.name} 
                            onChange={onChange} 
                            required
                        />
                    </div>
                )}

                <div className='input'>
                    {/*<img src={email_icon} alt="email_icon" />*/}
                    <input 
                        name="email" 
                        type="email" 
                        placeholder='Email' 
                        value={form.email} 
                        onChange={onChange} 
                        required
                    />
                </div>

                <div className='input'>
                    {/*<img src={password_icon} alt="password_icon" />*/}
                    <input 
                        name="password" 
                        type="password" 
                        placeholder='Password'
                        value={form.password} 
                        onChange={onChange} 
                        required
                    />
                </div>
            </div>

            {msg && <p className="msg">{msg}</p>}

            {/* lost password */}
            {action === "Sign Up" ? null : (
                <div className="forgot-password">
                    Esqueceu a senha? <span>Clique Aqui</span>
                </div>
            )}

            {/* submit button */}
            <div className="submit-wrap">
                <button 
                    type="button" 
                    className="submit" 
                    onClick={handleButtonClick} 
                    disabled={loading}
                >
                    {loading ? (action === 'Sign Up' ? 'Criando...' : 'Entrando...') : (action === 'Sign Up' ? 'Criar conta' : 'Entrar')}
                </button>
            </div>
        </div>
    );
};

export default LoginSignUp;