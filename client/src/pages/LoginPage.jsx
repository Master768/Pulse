import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
            alert(`Login failed: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side: Illustration/Stats */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-20 relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 text-white mb-32">
                        <Zap size={24} className="text-primary fill-current" />
                        <span className="text-2xl font-bold tracking-tight">PULSE.</span>
                    </Link>
                    <h2 className="text-6xl font-bold text-white leading-tight mb-8">
                        The Operating<br />System for your<br /><span className="text-primary">Performance.</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-sm leading-relaxed">
                        Track your performance metrics and optimize your daily rhythm.
                    </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-6">
                    <p className="text-sm font-semibold text-slate-500">Your personal focus intelligence system.</p>
                </div>
                <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_70%_30%,#2563EB_0%,transparent_50%)]" />
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col justify-center p-8 md:p-24 lg:p-32 bg-slate-50">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 font-medium">Log in to your account to continue your performance audit.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="email" 
                                    required 
                                    className="input-field pl-12"
                                    placeholder="name@email.com" 
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="password" 
                                    required 
                                    className="input-field pl-12"
                                    placeholder="••••••••" 
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 group">
                            Log In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-12 text-center text-sm text-slate-500">
                        Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;