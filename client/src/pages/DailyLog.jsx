/**
 * DAILY LOG PAGE
 * 
 * This component provides a comprehensive form for users to log their daily habits.
 * It features dynamic time-capping logic (ensuring a day doesn't exceed 24 hours)
 * and interacts with the Pulse Backend API to save logs and trigger ML predictions.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Moon, Monitor, Activity, Smile, 
  AlertTriangle, Coffee, Droplets, CheckCircle, 
  ArrowRight, Brain, MousePointer2, Clock, Info
} from 'lucide-react';

/**
 * INPUT BLOCK COMPONENT
 * A reusable UI component for range-based input fields.
 * 
 * Props:
 * icon, title, value, unit, min, max, step, field, onChange, colorClass, bgClass
 */
const InputBlock = ({ icon, title, value, unit, min, max, step, field, onChange, colorClass = "text-primary", bgClass = "bg-primary/10" }) => (
  <div className="pro-card p-10 rounded-[2.5rem] relative overflow-hidden group">
    <div className="flex justify-between items-start mb-8">
       <div className={`p-4 ${bgClass} ${colorClass} rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-300`}>
          {icon}
       </div>
       <div className="text-right">
          <h4 className="text-[10px] font-extrabold text-[#111827] uppercase tracking-[0.2em] mb-1 opacity-70">{title}</h4>
          <p className="text-4xl font-extrabold text-[#111827]">{value} <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold ml-1">{unit}</span></p>
       </div>
    </div>
    <div className="relative pt-4">
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(field, parseFloat(e.target.value))}
        className="w-full h-2.5 rounded-full accent-primary cursor-pointer appearance-none transition-all"
        style={{
          background: `linear-gradient(to right, #2D7D72 0%, #2D7D72 ${(value - min) / (max - min) * 100}%, #f1f5f9 ${(value - min) / (max - min) * 100}%, #f1f5f9 100%)`
        }}
      />
      <div className="flex justify-between mt-3 px-1">
        <span className="text-[10px] font-bold text-slate-300">0</span>
        <span className="text-[10px] font-bold text-slate-300">{max}</span>
      </div>
    </div>
  </div>
);

const DailyLog = () => {
  // --- STATE MANAGEMENT ---
  // Stores the values for all 10 tracked metrics
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
  const [isAudited, setIsAudited] = useState(false); // True if today's log already exists
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  /**
   * INITIAL DATA FETCHING
   * Checks if the user has already submitted a log for today.
   * If they have, it pre-fills the form with their existing data.
   */
  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const res = await api.get('/logs');
        if (res.data.data && res.data.data.length > 0) {
          // Normalize today's date to YYYY-MM-DD for comparison
          const localToday = new Date().toLocaleDateString('en-CA');
          
          const latestLog = res.data.data.find(log => {
             const logLocal = new Date(log.date).toLocaleDateString('en-CA');
             return logLocal === localToday && log.is_completed;
          });

          if (latestLog) {
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
        console.error("Error fetching context:", err);
      }
    };
    fetchTodayLog();
  }, []);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '🤩'];
  const stressLabels = ['None', 'Low', 'Mod', 'High', 'Peak'];

  /**
   * TIME ACCOUNTABILITY LOGIC
   * Calculates the total sum of hours logged for the day.
   */
  const calculateTotalHours = (data) => {
    return (data.sleepHours || 0) + 
           (data.studyHours || 0) + 
           (data.screenTimeHours || 0) + 
           ((data.exerciseMins || 0) / 60) + 
           ((data.socialMediaMins || 0) / 60);
  };

  const totalHoursUsed = calculateTotalHours(formData);

  /**
   * DYNAMIC FIELD HANDLER
   * Ensures that the user cannot log more than 24 hours in a single day.
   * If they try to increase a field beyond the 24h limit, it caps the value automatically.
   */
  const handleChange = (field, value) => {
    setFormData(prev => {
      const timeFields = ['sleepHours', 'studyHours', 'screenTimeHours', 'exerciseMins', 'socialMediaMins'];
      
      if (timeFields.includes(field)) {
        // Calculate what the total WOULD be if we applied this change
        const otherTotal = calculateTotalHours({ ...prev, [field]: 0 });
        const proposedTotal = otherTotal + (field.endsWith('Mins') ? value / 60 : value);
        
        // If it exceeds 24h, cap it at the maximum remaining duration
        if (proposedTotal > 24) {
          const maxPossible = 24 - otherTotal;
          let cappedValue = field.endsWith('Mins') 
            ? Math.floor(maxPossible * 60) 
            : Math.floor(maxPossible * 2) / 2;
          
          return { ...prev, [field]: Math.max(0, cappedValue) };
        }
      }
      
      return { ...prev, [field]: value };
    });
  };

  /**
   * FORM SUBMISSION
   * Sends the collected data to the backend /api/logs endpoint.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const d = new Date();
      const dayKey = d.toLocaleDateString('en-CA'); // Standard YYYY-MM-DD format
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      
      const payload = { 
         ...formData, 
         date: d.toISOString(),
         dayKey,
         dayOfWeek: days[d.getDay()],
         isWeekend: (d.getDay() === 0 || d.getDay() === 6)
      };

      const res = await api.post('/logs', payload);
      
      // Check if we updated an existing log or created a brand new one
      const isUpdated = res.data.data.prediction?.isEdited;
      setSuccessMsg(isUpdated ? 'Changes updated successfully!' : 'Daily audit saved successfully!');
      
      setIsAudited(true);
      setShowSuccess(true);
      
      // Auto-redirect to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (showSuccess) return isAudited ? 'CHANGES UPDATED' : 'AUDIT SAVED';
    if (isSubmitting) return 'PREDICTING...';
    return isAudited ? 'UPDATE DAILY LOG' : 'SAVE DAILY LOG';
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in relative">
      {/* SUCCESS BANNER */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-primary text-white rounded-2xl shadow-2xl flex items-center gap-4 font-bold"
          >
            <CheckCircle size={24} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="mb-12 text-center">
        <p className="text-sm font-extrabold text-[#2D7D72] uppercase tracking-[0.3em] mb-3">Internal Audit</p>
        <h1 className="text-5xl font-extrabold text-[#111827] tracking-tight mb-4">Daily Pulse Check</h1>
        <p className="text-slate-500 font-bold max-w-xl mx-auto">Record your lifestyle metrics to update your productivity map.</p>
      </div>
      
      {/* NOTIFICATION FOR MULTIPLE EDITS */}
      {isAudited && !showSuccess && (
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-primary">
           <Info size={20} />
           <p className="font-semibold text-sm">Your daily log has already been audited for today! You can update your metrics below.</p>
        </div>
      )}

      {/* TIME CAPACITY PROGRESS BAR */}
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="flex justify-between items-end mb-3 px-2">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Day Accountability</h4>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Time blocks must not exceed 24 hours</p>
          </div>
          <p className={`text-2xl font-black ${totalHoursUsed >= 24 ? 'text-rose-500' : totalHoursUsed > 20 ? 'text-amber-500' : 'text-primary'}`}>
            {totalHoursUsed.toFixed(1)} <span className="text-xs text-slate-400">/ 24h</span>
          </p>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(totalHoursUsed / 24) * 100}%` }}
            className={`h-full rounded-full shadow-sm ${totalHoursUsed >= 24 ? 'bg-rose-500' : totalHoursUsed > 20 ? 'bg-amber-500' : 'bg-primary'}`}
          />
        </div>
      </div>

      {/* MAIN LOGGING FORM */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* METRIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InputBlock icon={<Moon size={20}/>} title="Sleep Duration" value={formData.sleepHours} unit="Hrs" min={0} max={Math.min(18, formData.sleepHours + (24 - totalHoursUsed))} step={0.5} field="sleepHours" onChange={handleChange} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
          <InputBlock icon={<Clock size={20}/>} title="Study/Focus" value={formData.studyHours} unit="Hrs" min={0} max={Math.min(18, formData.studyHours + (24 - totalHoursUsed))} step={0.5} field="studyHours" onChange={handleChange} colorClass="text-[#2D7D72]" bgClass="bg-[#2D7D72]/10" />
          <InputBlock icon={<Monitor size={20}/>} title="Screen Usage" value={formData.screenTimeHours} unit="Hrs" min={0} max={Math.min(20, formData.screenTimeHours + (24 - totalHoursUsed))} step={0.5} field="screenTimeHours" onChange={handleChange} colorClass="text-rose-500" bgClass="bg-rose-50" />
          <InputBlock icon={<Activity size={20}/>} title="Physical Activity" value={formData.exerciseMins} unit="Mins" min={0} max={Math.min(300, formData.exerciseMins + Math.floor((24 - totalHoursUsed) * 60))} step={5} field="exerciseMins" onChange={handleChange} colorClass="text-emerald-500" bgClass="bg-emerald-50" />
          
          <InputBlock icon={<Coffee size={20}/>} title="Caffeine" value={formData.caffeineIntake} unit="Cups" min={0} max={10} step={1} field="caffeineIntake" onChange={handleChange} colorClass="text-amber-500" bgClass="bg-amber-50" />
          <InputBlock icon={<Droplets size={20}/>} title="Hydration" value={formData.waterLitres} unit="Ltrs" min={0} max={10} step={0.5} field="waterLitres" onChange={handleChange} colorClass="text-sky-500" bgClass="bg-sky-50" />
          <InputBlock icon={<Brain size={20}/>} title="Deep Work" value={formData.deepFocusBlocks} unit="Blocks" min={0} max={10} step={1} field="deepFocusBlocks" onChange={handleChange} colorClass="text-violet-500" bgClass="bg-violet-50" />
          <InputBlock icon={<MousePointer2 size={20}/>} title="Social Media" value={formData.socialMediaMins} unit="Mins" min={0} max={Math.min(300, formData.socialMediaMins + Math.floor((24 - totalHoursUsed) * 60))} step={10} field="socialMediaMins" onChange={handleChange} colorClass="text-orange-500" bgClass="bg-orange-50" />
        </div>

        {/* PSYCHOLOGICAL METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* MOOD SELECTOR */}
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

           {/* STRESS SELECTOR */}
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

         {/* SUBMISSION BUTTON */}
         <div className="pt-6 text-center">
            <button 
               type="submit" 
               disabled={isSubmitting || showSuccess}
               className={`btn-primary px-12 py-5 text-xl flex items-center justify-center gap-3 mx-auto ${isSubmitting || showSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
               {getButtonText()}
               {showSuccess ? <CheckCircle size={24} /> : <ArrowRight size={24} />}
            </button>
            <p className="mt-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] opacity-80">
               {showSuccess ? 'Your insights have been recalculated' : 'Saving your personal productivity markers...'}
            </p>
         </div>
      </form>
    </div>
  );
};

export default DailyLog;