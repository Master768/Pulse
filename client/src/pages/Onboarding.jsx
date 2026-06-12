/**
 * ONBOARDING PAGE
 * 
 * This is a multi-step "Wizard" that collects the user's baseline data 
 * after they sign up. This data is critical for calibrating the ML models.
 * Steps:
 * 1. PERSONAL: Basic identity and professional context.
 * 2. GOALS: Productivity and health targets (Sleep, Screen Time).
 * 3. COMPLETE: Final confirmation and dashboard transition.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, CheckCircle2, Clock, 
  ArrowRight, Sparkles, ChevronLeft
} from 'lucide-react';

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  // --- STATE ---
  const [step, setStep] = useState(1); // Current wizard page
  const [direction, setDirection] = useState(0); // Animation direction (1 for forward, -1 for back)
  const [formData, setFormData] = useState({
    name: '', 
    age: '', 
    occupation: '',
    sleepGoal: 8, 
    screenLimit: 4, 
    focusTarget: 3,
    mainGoal: 'productivity',
    goalPersona: 'Balanced Optimizer'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- NAVIGATION HANDLERS ---
  const handleNext = () => {
    setDirection(1);
    setStep(s => s + 1);
  };
  
  const handleBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  /**
   * FINAL SUBMISSION
   * Saves the onboarding profile to the database and marks onboarding as complete.
   */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // We use PATCH because the user record already exists (created at signup); 
      // we are just filling in the missing pulse profile data.
      await api.patch('/auth/onboarding', { ...formData, onboardingComplete: true });
      
      // SYNC: Update the global auth context so the Dashboard sees the new goal
      updateUser({ 
        ...formData, 
        onboardingComplete: true 
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard'); // Fallback if patch fails
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Personal", icon: <User size={18} /> },
    { title: "Benchmarks", icon: <Clock size={18} /> },
    { title: "Persona", icon: <Sparkles size={18} /> },
    { title: "Complete", icon: <CheckCircle2 size={18} /> }
  ];

  const personas = [
    { name: 'Balanced Optimizer', desc: 'Sustainable productivity and high well-being.' },
    { name: 'High Performer', desc: 'Maximum output and deep focus blocks.' },
    { name: 'Under Pressure', desc: 'Manage high stress while maintaining output.' },
    { name: 'Restricted Sleep', desc: 'Optimize performance despite limited rest.' }
  ];

  /**
   * ANIMATION VARIANTS
   * Controls the "sliding" effect as the user moves between steps.
   */
  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 20 : -20, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* PROGRESS STEPPER: Visual indicator of current progress */}
        <div className="mb-12">
           <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step {step} of {steps.length}</span>
              <span className="text-xs font-bold text-slate-400">{Math.round((step/steps.length)*100)}% Complete</span>
           </div>
           {/* Progress Bar */}
           <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / steps.length) * 100}%` }}
                className="h-full bg-primary transition-all duration-500"
              />
           </div>
           
           {/* Step Icons */}
           <div className="mt-8 flex justify-between">
              {steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${step >= i + 1 ? 'opacity-100' : 'opacity-40'}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === i + 1 ? 'bg-primary text-white shadow-md' : step > i + 1 ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
                   </div>
                   <span className="hidden sm:block text-xs font-bold text-slate-600 uppercase tracking-wider">{s.title}</span>
                </div>
              ))}
           </div>
        </div>

        {/* CONTENT WIZARD: Dynamic section based on current step */}
        <div className="pro-card rounded-3xl p-8 md:p-12 min-h-[500px] flex flex-col justify-between">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <motion.div 
                   key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" 
                   transition={{ duration: 0.4 }} className="space-y-10"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Tell us about yourself</h2>
                    <p className="text-lg text-slate-500">We synchronize your productivity model based on your professional context.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field text-xl font-semibold" placeholder="John Doe" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Occupation</label>
                        <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="input-field text-xl font-semibold" placeholder="Engineer, Designer, etc." />
                     </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: GOALS & BENCHMARKS */}
              {step === 2 && (
                <motion.div 
                   key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" 
                   transition={{ duration: 0.4 }} className="space-y-10"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Set your benchmarks</h2>
                    <p className="text-lg text-slate-500">Establishing these metrics helps the system track your recovery and focus.</p>
                  </div>

                  <div className="space-y-12 max-w-xl">
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Daily Sleep Goal</label>
                           <span className="text-2xl font-bold text-primary">{formData.sleepGoal} hr</span>
                        </div>
                        <input type="range" min="4" max="12" step="0.5" value={formData.sleepGoal} onChange={e => setFormData({...formData, sleepGoal: e.target.value})} className="w-full h-2 bg-slate-100 rounded-full accent-primary cursor-pointer appearance-none" />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Daily Screen Limit</label>
                           <span className="text-2xl font-bold text-error">{formData.screenLimit} hr</span>
                        </div>
                        <input type="range" min="1" max="15" step="0.5" value={formData.screenLimit} onChange={e => setFormData({...formData, screenLimit: e.target.value})} className="w-full h-2 bg-slate-100 rounded-full accent-error cursor-pointer appearance-none" />
                     </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PERFORMANCE PERSONA GOAL */}
              {step === 3 && (
                <motion.div 
                   key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" 
                   transition={{ duration: 0.4 }} className="space-y-10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        Target Performance <Sparkles className="text-primary" size={24} />
                      </h2>
                      <p className="text-lg text-slate-500">Select the behavioral style you want the AI to optimize for.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {personas.map((p, i) => (
                        <button 
                           key={i}
                           onClick={() => setFormData({...formData, goalPersona: p.name})}
                           className={`p-8 rounded-[2rem] border text-left transition-all group relative overflow-hidden ${formData.goalPersona === p.name ? 'bg-primary border-primary text-white shadow-2xl scale-[1.02]' : 'bg-slate-50/50 border-slate-100 hover:border-primary/20 hover:bg-white'}`}
                        >
                           <div className="relative z-10">
                              <div className="flex justify-between items-center mb-4">
                                 <h4 className={`text-sm font-black uppercase tracking-[0.1em] ${formData.goalPersona === p.name ? 'text-white' : 'text-slate-900'}`}>{p.name}</h4>
                                 {formData.goalPersona === p.name ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                              </div>
                              <p className={`text-xs leading-relaxed font-medium ${formData.goalPersona === p.name ? 'text-white/80' : 'text-slate-500'}`}>{p.desc}</p>
                           </div>
                           {formData.goalPersona === p.name && (
                             <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                           )}
                        </button>
                     ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS & COMPLETION */}
              {step === 4 && (
                <motion.div 
                   key="step4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" 
                   transition={{ duration: 0.4 }} className="text-center py-10"
                >
                  <div className="inline-flex p-8 bg-success/10 text-success rounded-3xl mb-8">
                     <CheckCircle2 size={64} />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">You're all set!</h2>
                  <p className="text-lg text-slate-500 mb-12 max-w-md mx-auto">
                    Your personalized dashboard is ready. We'll start tracking your productivity markers immediately.
                  </p>
                  
                  <button 
                    onClick={handleSubmit} disabled={loading} 
                    className="btn-primary w-full max-w-sm py-5 text-xl relative"
                  >
                    {loading ? 'Finalizing...' : 'Go to Dashboard'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper Controls */}
          {step < 4 && (
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
               <button onClick={handleBack} disabled={step === 1} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all">
                 <ChevronLeft size={18} /> Previous
               </button>
               <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                 Continue <ArrowRight size={18} />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;