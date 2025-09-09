import React, { useState } from 'react'
import './LoginSignUp.css'
import user_icon from '../assets/user.png'
import email_icon from '../assets/email.png'
import password_icon from '../assets/password.png'

const LoginSignUp = () => {

    const [action,setAction] = useState("Login");

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [msg, setMsg] = useState("");

    const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    async function handleSignup() {
    setMsg("");
    try {
        const r = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Erro no cadastro");
        setMsg("Conta criada! Faça login.");
        setAction("Login");
    } catch (err) {
        setMsg(err.message);
    }
    }

    async function handleLogin() {
    setMsg("");
    try {
        const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Erro no login");
        localStorage.setItem("token", data.token); // simples para dev
        setMsg("Login OK!");
    } catch (err) {
        setMsg(err.message);
    }
    }



    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>{action}</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                {action==="Login"?<div></div>:
                <div className='input'>
                    <img src={user_icon} alt="" />
                    <input type="text" placeholder='Name'/>
                </div>}

                <div className='input'>
                    <img src={email_icon} alt="" />
                    <input type="email" placeholder='Email'/>
                </div>
                <div className='input'>
                    <img src={password_icon} alt="" />
                    <input type="password" placeholder='Password'/>
                </div>
            </div>
            {action==="Sign Up"?<div></div>:
            <div className="forgot-password">Lost Password? <span>Click Here</span></div>}
            <div className="submit-container">
                <div className={action==="Login"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
                <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>Login</div>
            </div>
        </div>
    );
};

export default LoginSignUp