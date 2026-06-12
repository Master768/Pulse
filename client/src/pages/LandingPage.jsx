/**
 * LANDING PAGE
 * 
 * The public-facing entry point of the application. 
 * Its mission is to convert visitors into users by explaining the 
 * value proposition of the Pulse ML engine and its benefits.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, TrendingUp, ArrowRight, CheckCircle2, Layout, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* --- HERO SECTION ---
          The "Hook": Grabs attention with large typography and primary CTA.
          Uses framer-motion to animate the entrance of the main content.
      */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold mb-8">
              <Sparkles size={16} /> NEW: ML-Driven Burnout Prediction
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-[#111827] tracking-tight mb-8 leading-[1.05]">
              Master Your Productivity,<br />Predict Your <span className="text-accent italic">Balance.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
              Our biological intelligence model analyzes your core metrics to help you reclaim focus and optimize your daily rhythm.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/signup')} 
                className="btn-primary px-10 py-5 text-lg flex items-center gap-3"
              >
                Get Started for Free <ArrowRight size={20} />
              </button>
              {/* Smooth scroll anchor */}
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline px-10 py-5 text-lg">
                How it works
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION ---
          The "How": Breakdown of core selling points like ML models and burnout alerts.
      */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Deep Analysis", icon: <Zap className="text-primary" />, desc: "Understand the biological markers driving your focus and fatigue." },
              { title: "Personalized Models", icon: <TrendingUp className="text-green-500" />, desc: "Our engine adapts to your unique sleep and activity rhythms." },
              { title: "Anti-Burnout", icon: <Shield className="text-red-500" />, desc: "Get real-time alerts when your stress levels indicate high burnout risk." }
            ].map((f, i) => (
              <div key={i} className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl w-fit">{f.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PERSONA ROADMAP SECTION --- */}
      <section className="py-32 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-bold mb-6">The Persona Engine</h2>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Pulse doesn't just track metrics; it maps your behavior into cognitive profiles. 
               Set your goal, and let the engine guide you there.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Balanced Optimizer', desc: 'The gold standard. Sustainable output paired with optimal recovery and health markers.' },
              { name: 'High Performer', desc: 'Maximum efficiency. Designed for users in high-output seasons who prioritize deep work blocks.' },
              { name: 'Under Pressure', desc: 'The warning state. High productivity that is currently being sustained by high stress.' },
              { name: 'Restricted Sleep', desc: 'The recovery bottleneck. Identifying when lack of rest is the primary driver of fatigue.' },
              { name: 'Burnout Recovery', desc: 'The restoration phase. A specialized mode focused on rebuilding cognitive capacity.' }
            ].map((p, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Sparkles size={24} />
                </div>
                <h4 className="text-xl font-bold mb-4 uppercase tracking-widest">{p.name}</h4>
                <p className="text-slate-400 leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* --- CALL TO ACTION (CTA) ---
          The "Closure": Final push to signing up before they leave.
      */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto pro-card rounded-[3rem] p-16 md:p-24 text-center bg-primary text-white relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Ready to optimize your performance?</h2>
              <p className="text-white/80 text-lg mb-12 max-w-lg mx-auto">
                Take control of your focus and achieve your peak performance potential.
              </p>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-white text-primary px-12 py-6 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all shadow-xl"
              >
                Sign Up Now
              </button>
           </div>
           {/* Visual background sparkles for premium feel */}
           <div className="absolute top-0 right-0 p-10 opacity-10"><Sparkles size={200} /></div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;