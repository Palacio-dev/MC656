import React, { useState } from 'react'
import validator from 'validator'
import './LoginSignUp.css'
import user_icon from '../assets/user.png'
import email_icon from '../assets/email.png'
import password_icon from '../assets/password.png'



const LoginSignUp = () => {
    const [action, setAction] = useState('Login')
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    async function handleSignup() {
    if (loading) return
    setMsg('')

    if (!validator.isEmail(form.email)) {
        return setMsg("E-mail inválido.");
    }

    try {
        // availability check
        const rCheck = await fetch(`/api/check-email?email=${encodeURIComponent(form.email)}`);
        const dCheck = await rCheck.json();
        if (dCheck.exists) {
        return setMsg('Este e-mail já está registrado.');
        }
    } catch (err) {
        return setMsg('Erro ao verificar e-mail.');
    }

    try {
        setLoading(true)
        const r = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || 'Erro no cadastro')
        setMsg('Conta criada! Faça login.')
        setAction('Login')
        setForm(f => ({ name: '', email: f.email, password: '' }))
    } catch (err) {
        setMsg(err.message)
    } finally {
        setLoading(false)
    }}


    async function handleLogin() {
    if (loading) return
    setMsg('')

    try {
        const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || 'Erro no login')
        localStorage.setItem('token', data.token)
        setMsg('Login OK') /* successfully logged*/
    } catch (err) {
        setMsg(err.message)
    } finally {
        setLoading(false)
    }
    }

    // decide which handler to call
    function onSubmit(e) {
    e.preventDefault()
    if (action === 'Sign Up') handleSignup()
    else handleLogin()
    }

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
            <img src={user_icon} alt="user_icon" />
            <input name="name" type="text" placeholder='Name' value={form.name} onChange={onChange} required/>
            </div>
        )}

        <div className='input'>
            <img src={email_icon} alt="email_icon" />
            <input name="email" type="email" placeholder='Email' value={form.email} onChange={onChange} required/>
        </div>

        <div className='input'>
            <img src={password_icon} alt="password_icon" />
            <input name="password" type="password" placeholder='Password'value={form.password} onChange={onChange} required/>
        </div>
        </div>

        {msg && <p className="msg">{msg}</p>}

        {/* lost password */}
        {action === "Sign Up" ? null : (
        <div className="forgot-password">Esqueceu a senha? <span>Clique Aqui</span></div>
        )}

        {/* submit button */}
        <div className="submit-wrap">
        <button type="button" className="submit" onClick={action === 'Sign Up' ? handleSignup : handleLogin} disabled={loading}>
            {loading ? (action === 'Sign Up' ? 'Criando...' : 'Entrando...') : (action === 'Sign Up' ? 'Criar conta' : 'Entrar')}
        </button>
        </div>
    </div>
    );
}

export default LoginSignUp
