import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

const SignupPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(formData.name, formData.email, formData.password);
            navigate('/onboarding');
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || 'Signup failed. Please try again.';
            alert(`Signup failed: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side: Value Prop */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-20 relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 text-white mb-32">
                        <Zap size={24} className="text-primary fill-current" />
                        <span className="text-2xl font-bold tracking-tight">PULSE.</span>
                    </Link>
                    <h2 className="text-6xl font-bold text-white leading-tight mb-12">
                        Build your<br />productivity<br /><span className="text-primary">Masterclass.</span>
                    </h2>
                    
                    <div className="space-y-8">
                        {[
                          "Analyze daily productivity markers",
                          "Detect early burnout indicators",
                          "Personalized focus-recovery models"
                        ].map((text, i) => (
                           <div key={i} className="flex items-center gap-4">
                              <div className="p-1 bg-primary rounded-full text-white"><CheckCircle2 size={16} /></div>
                              <span className="text-lg text-slate-300 font-medium">{text}</span>
                           </div>
                        ))}
                    </div>
                </div>
                
                <p className="relative z-10 text-sm font-semibold text-slate-500">© 2026 Pulse Intelligence Systems.</p>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-30 bg-[radial-gradient(circle_at_center,#2563EB_0%,transparent_70%)]" />
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col justify-center p-8 md:p-24 lg:p-32 bg-slate-50">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Get started</h1>
                        <p className="text-slate-500 font-medium">Create your account to start your performance journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="text" 
                                    required 
                                    className="input-field pl-12"
                                    placeholder="John Doe" 
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                />
                            </div>
                        </div>

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
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Create Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="password" 
                                    required 
                                    className="input-field pl-12"
                                    placeholder="Min. 8 characters" 
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 group">
                            Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed px-8">
                       By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
                    </p>

                    <p className="mt-12 text-center text-sm text-slate-500">
                        Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;