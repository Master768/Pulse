/**
 * LOGIN PAGE
 * 
 * This page allows existing users to authenticate.
 * It features a split-screen design: 
 * - Left: Branding and value proposition.
 * - Right: Secure login form with validation handling.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    // --- STATE ---
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth(); // Grab the login function from our global context
    const navigate = useNavigate();

    /**
     * FORM SUBMISSION Logic
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the browser from reloading the page
        try {
            // 1. Authenticate with the backend
            await login(formData.email, formData.password);
            // 2. SUCCESS: Redirect to the user's focus dashboard
            navigate('/dashboard');
        } catch (err) {
            // 3. ERROR: Show a user-friendly alert with the failure reason
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
            alert(`Login failed: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            
            {/* --- LEFT SIDE: BRANDING PANEL (Hidden on mobile) --- */}
            <div className="hidden lg:flex flex-col justify-between bg-white p-20 relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 text-slate-900 mb-32">
                        <Zap size={24} className="text-primary fill-current" />
                        <span className="text-2xl font-bold tracking-tight">PULSE.</span>
                    </Link>
                    <h2 className="text-6xl font-bold text-slate-900 leading-tight mb-8">
                        The Operating<br />System for your<br /><span className="text-primary">Performance.</span>
                    </h2>
                    <p className="text-xl text-slate-500 max-w-sm leading-relaxed">
                        Track your performance metrics and optimize your daily rhythm.
                    </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-6">
                    <p className="text-sm font-semibold text-slate-400">Your personal focus intelligence system.</p>
                </div>
                {/* Visual background gradient for premium feel */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_70%_30%,#2563EB_0%,transparent_50%)]" />
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="flex flex-col justify-center p-8 md:p-24 lg:p-32 bg-slate-50">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 font-medium">Log in to your account to continue your performance audit.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
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

                        {/* Password Input */}
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