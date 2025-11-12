import React from 'react';
import '../Styles/LoginSignUp.css';
import { useLoginSignUp } from '../Hooks/useLoginSignUp';


const LoginSignUp: React.FC = () => {
    // Connect to business logic hook
    const viewModel = useLoginSignUp();

    // Pure presentation handler - just delegates to ViewModel
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        viewModel.updateForm(name as keyof typeof viewModel.form, value);
    };

    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>{viewModel.action}</div>
                <div className='underline'></div>
            </div>

            {/* sign up and login buttons */}
            <div className="mode-switch">
                <button
                    type="button"
                    className={viewModel.action === 'Login' ? 'toggle gray' : 'toggle'}
                    onClick={() => viewModel.setAction('Sign Up')}
                >
                    Sign Up
                </button>
                <button
                    type="button"
                    className={viewModel.action === 'Sign Up' ? 'toggle gray' : 'toggle'}
                    onClick={() => viewModel.setAction('Login')}
                >
                    Login
                </button>
            </div>

            {/* input boxes */}
            <div className='inputs'>
                {viewModel.isSignUpMode && (
                    <div className='input'>
                        <input 
                            name="name" 
                            type="text" 
                            placeholder='Name' 
                            value={viewModel.form.name} 
                            onChange={handleInputChange} 
                            required
                        />
                    </div>
                )}

                <div className='input'>
                    <input 
                        name="email" 
                        type="email" 
                        placeholder='Email' 
                        value={viewModel.form.email} 
                        onChange={handleInputChange} 
                        required
                    />
                </div>

                <div className='input'>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder='Password'
                        value={viewModel.form.password} 
                        onChange={handleInputChange} 
                        required
                    />
                </div>
            </div>

            {viewModel.message && <p className="msg">{viewModel.message}</p>}

            {/* lost password */}
            {!viewModel.isSignUpMode && (
                <div className="forgot-password">
                    Esqueceu a senha? <span>Clique Aqui</span>
                </div>
            )}

            {/* submit button */}
            <div className="submit-wrap">
                <button 
                    type="button" 
                    className="submit" 
                    onClick={viewModel.handleSubmit} 
                    disabled={viewModel.loading}
                >
                    {viewModel.submitButtonText}
                </button>
            </div>
        </div>
    );
};

export default LoginSignUp;