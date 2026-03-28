import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, TrendingUp, ArrowRight, CheckCircle2, Layout, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-bold mb-8">
              <Sparkles size={16} /> NEW: PERFORMANCE INSIGHTS V2
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.05]">
              Master your productivity<br /><span className="text-primary">with biological intelligence.</span>
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
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline px-10 py-5 text-lg">
                How it works
              </button>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Features */}
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

      {/* Social Proof/Footer-ish CTA */}
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
           <div className="absolute top-0 right-0 p-10 opacity-10"><Sparkles size={200} /></div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;