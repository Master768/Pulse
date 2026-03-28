import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Moon, Monitor, Activity, Smile, 
  AlertTriangle, Coffee, Droplets, CheckCircle, 
  ArrowRight, Brain, MousePointer2, Clock, Info
} from 'lucide-react';

const InputBlock = ({ icon, title, value, unit, min, max, step, field, onChange }) => (
  <div className="pro-card p-8 rounded-2xl relative overflow-hidden group">
    <div className="flex justify-between items-start mb-6">
       <div className="p-3 bg-primary/5 text-primary rounded-xl">
          {icon}
       </div>
       <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">{value} <span className="text-xs text-slate-400 uppercase">{unit}</span></p>
       </div>
    </div>
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{title}</h4>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange(field, parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-100 rounded-full accent-primary cursor-pointer appearance-none"
    />
  </div>
);

const DailyLog = () => {
  const [formData, setFormData] = useState({
    sleepHours: 7.5,
    studyHours: 6,
    screenTimeHours: 4,
    exerciseMins: 30,
    caffeineIntake: 2,
    waterLitres: 2.0,
    deepFocusBlocks: 2,
    socialMediaMins: 60,
    moodScore: 4,
    stressLevel: 2
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAudited, setIsAudited] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const res = await api.get('/logs');
        if (res.data.data && res.data.data.length > 0) {
          const latestLog = res.data.data[0];
          const today = new Date().setHours(0,0,0,0);
          const logDate = new Date(latestLog.date).setHours(0,0,0,0);
          if (today === logDate && latestLog.is_completed) {
            setFormData({
              sleepHours: latestLog.sleepHours || 7.5,
              studyHours: latestLog.studyHours || 6,
              screenTimeHours: latestLog.screenTimeHours || 4,
              exerciseMins: latestLog.exerciseMins || 30,
              caffeineIntake: latestLog.caffeineIntake || 2,
              waterLitres: latestLog.waterLitres || 2.0,
              deepFocusBlocks: latestLog.deepFocusBlocks || 2,
              socialMediaMins: latestLog.socialMediaMins || 60,
              moodScore: latestLog.moodScore || 4,
              stressLevel: latestLog.stressLevel || 2
            });
            setIsAudited(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTodayLog();
  }, []);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '🤩'];
  const stressLabels = ['None', 'Low', 'Mod', 'High', 'Peak'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create local copies of date properties for ML compatibility
      const d = new Date();
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const payload = { 
         ...formData, 
         date: d.toISOString(),
         dayOfWeek: days[d.getDay()],
         isWeekend: (d.getDay() === 0 || d.getDay() === 6)
      };

      await api.post('/logs', payload);
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-12">
        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Daily Ritual</p>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Log Performance</h1>
      </div>
      
      {isAudited && (
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-primary">
           <Info size={20} />
           <p className="font-semibold text-sm">Your daily log has already been audited for today! You can update your metrics below.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InputBlock icon={<Moon size={20}/>} title="Sleep" value={formData.sleepHours} unit="hr" min={0} max={15} step={0.5} field="sleepHours" onChange={handleChange} />
          <InputBlock icon={<Clock size={20}/>} title="Study Time" value={formData.studyHours} unit="hr" min={0} max={18} step={0.5} field="studyHours" onChange={handleChange} />
          <InputBlock icon={<Monitor size={20}/>} title="Screen Time" value={formData.screenTimeHours} unit="hr" min={0} max={20} step={0.5} field="screenTimeHours" onChange={handleChange} />
          <InputBlock icon={<Activity size={20}/>} title="Exercise" value={formData.exerciseMins} unit="min" min={0} max={300} step={5} field="exerciseMins" onChange={handleChange} />
          
          <InputBlock icon={<Coffee size={20}/>} title="Caffeine" value={formData.caffeineIntake} unit="cups" min={0} max={10} step={1} field="caffeineIntake" onChange={handleChange} />
          <InputBlock icon={<Droplets size={20}/>} title="Hydration" value={formData.waterLitres} unit="L" min={0} max={6} step={0.5} field="waterLitres" onChange={handleChange} />
          <InputBlock icon={<Brain size={20}/>} title="Deep Focus" value={formData.deepFocusBlocks} unit="blocks" min={0} max={10} step={1} field="deepFocusBlocks" onChange={handleChange} />
          <InputBlock icon={<MousePointer2 size={20}/>} title="Social Media" value={formData.socialMediaMins} unit="min" min={0} max={300} step={10} field="socialMediaMins" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="pro-card rounded-3xl p-10">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-xl font-bold text-slate-900">Current Mood</h4>
                 <Smile className="text-primary" size={24} />
              </div>
              <div className="flex justify-between gap-3">
                 {moodEmojis.map((emoji, i) => (
                    <button 
                       key={i} 
                       type="button"
                       onClick={() => handleChange('moodScore', i + 1)}
                       className={`flex-1 aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all ${formData.moodScore === i + 1 ? 'bg-primary text-white shadow-lg scale-105' : 'bg-slate-50 hover:bg-slate-100 opacity-60'}`}
                    >
                       {emoji}
                    </button>
                 ))}
              </div>
           </div>

           <div className="pro-card rounded-3xl p-10">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-xl font-bold text-slate-900">Stress Level</h4>
                 <AlertTriangle className="text-error" size={24} />
              </div>
              <div className="flex gap-2">
                 {stressLabels.map((label, i) => (
                    <button 
                       key={i} 
                       type="button"
                       onClick={() => handleChange('stressLevel', i + 1)}
                       className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${formData.stressLevel === i + 1 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                       {label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="pt-6 text-center">
           <button 
              type="submit" 
              disabled={isSubmitting}
              className={`btn-primary px-12 py-5 text-xl flex items-center justify-center gap-3 mx-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
              {showSuccess ? (
                 <>AUDIT SAVED <CheckCircle size={24} /></>
              ) : (
                 <>{isAudited ? 'UPDATE DAILY LOG' : 'SAVE DAILY LOG'} <ArrowRight size={24} /></>
              )}
           </button>
           <p className="mt-6 text-xs font-bold text-slate-300 uppercase tracking-widest">Saving your personal productivity markers...</p>
        </div>
      </form>
    </div>
  );
};

export default DailyLog;