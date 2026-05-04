/**
 * SETTINGS PAGE
 * 
 * This page allows users to customize their Pulse profile and manage their data.
 * Features:
 * 1. IDENTITY MANAGEMENT: Update display name and view account info.
 * 2. SYSTEM PERSONA: Switch between different behavioral optimization targets.
 * 3. DATA SOVEREIGNTY: Export all raw performance logs to CSV.
 * 4. OPERATIONAL TARGETS: View system-calculated goals for sleep, caffeine, etc.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Database, Sparkles, 
  Download, Sliders, ShieldCheck,
  CheckCircle2, AlertCircle, Edit3, X, Save,
  Droplets, Coffee, Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  
  // --- STATE ---
  const [updating, setUpdating] = useState(false); // Loading state for API calls
  const [feedback, setFeedback] = useState(null); // Success/Error snackbar content
  const [isEditingName, setIsEditingName] = useState(false); // Toggle for inline name editing
  const [newName, setNewName] = useState(user?.name || '');
  const [selectedGoal, setSelectedGoal] = useState(user?.goalPersona || 'Balanced Optimizer');

  // SYNC: Ensure the local selection matches the global state when the user object is loaded/updated
  React.useEffect(() => {
    if (user?.goalPersona) {
      setSelectedGoal(user.goalPersona);
    }
  }, [user]);

  const personas = ['Balanced Optimizer', 'High Performer', 'Under Pressure', 'Restricted Sleep'];

  /**
   * UPDATE NAME
   * Syncs the new display name with the server and local storage.
   */
  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await api.patch('/auth/onboarding', { name: newName });
      // Update local storage so the change persists on refresh
      const updatedUser = { ...user, name: newName };
      localStorage.setItem('pulse_user', JSON.stringify(updatedUser));
      setFeedback({ type: 'success', msg: 'Profile updated successfully' });
      setIsEditingName(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * UPDATE PERSONA
   * Switches the behavioral profile which affects how productivity is calculated.
   */
  const handleUpdatePersona = async (newPersona) => {
    setUpdating(true);
    try {
      await api.patch('/auth/onboarding', { persona: newPersona });
      const updatedUser = { ...user, persona: newPersona };
      localStorage.setItem('pulse_user', JSON.stringify(updatedUser));
      setFeedback({ type: 'success', msg: `Personality set to ${newPersona}` });
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * DATA EXPORT ENGINE
   * Fetches all raw logs and converts them into a downloadable CSV file.
   */
  const handleExportCSV = async () => {
    try {
      const res = await api.get('/logs');
      const logs = res.data.data;
      if (!logs || logs.length === 0) {
        setFeedback({ type: 'error', msg: 'No data found to export.' });
        return;
      }

      // 1. Clean data (remove MongoDB internal fields like __v and _id)
      const cleanLogs = logs.map(({ _id, __v, user, ...rest }) => rest);
      
      // 2. Generate CSV String
      const headers = Object.keys(cleanLogs[0]).join(',');
      const rows = cleanLogs.map(log => 
          Object.values(log).map(val => typeof val === 'string' ? `"${val}"` : val).join(',')
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      
      // 3. Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `pulse_data_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setFeedback({ type: 'success', msg: 'CSV Exported Successfully' });
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Export failed.' });
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Preferences</p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Personal Engine configuration</h1>
        </div>
        
        {/* FEEDBACK SNACKBAR */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${feedback.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-bold uppercase tracking-wide">{feedback.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- LEFT PANEL: IDENTITY CARD --- */}
        <div className="lg:col-span-4">
           <div className="pro-card rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 -mt-12 group-hover:h-32 transition-all duration-500" />
              <div className="relative z-10">
                {/* User Avatar (First Initial) */}
                <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center text-4xl font-bold mx-auto mb-8 shadow-2xl shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                   {user?.name?.[0] || 'U'}
                </div>
                
                {/* Inline Name Editor */}
                {isEditingName ? (
                  <div className="mb-4">
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-center">
                      <button onClick={handleUpdateProfile} className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"><Save size={18}/></button>
                      <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"><X size={18}/></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">{user?.name || newName}</h3>
                    <p className="text-sm font-bold text-slate-400 mb-8 tracking-tight">{user?.email}</p>
                  </>
                )}

                <div className="inline-flex px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.15em] rounded-full mb-10">
                   {user?.persona || 'Balanced'}
                </div>
                
                {!isEditingName && (
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 size={16} /> Edit Display Identity
                    </button>
                    <button onClick={logout} className="w-full py-4 text-xs font-bold text-slate-400 hover:text-error transition-colors uppercase tracking-widest">
                      Terminate Session
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* --- RIGHT PANEL: CONFIGURATION GRID --- */}
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* GOAL PERSONA: What the user wants to achieve */}
              <div className="pro-card rounded-[2.5rem] p-10 group bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3.5 bg-primary/10 text-primary rounded-[1.25rem] shadow-sm"><Sparkles size={22} /></div>
                  <h4 className="text-xl font-bold text-slate-900">Performance Goal</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Set Your Target State</p>
                  <div className="grid grid-cols-1 gap-2 mb-6">
                    {personas.map((p) => (
                      <button 
                        key={p}
                        disabled={updating}
                        onClick={() => setSelectedGoal(p)}
                        className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border text-left flex justify-between items-center ${selectedGoal === p ? 'bg-primary border-primary text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {p}
                        {selectedGoal === p && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>

                  {/* SAVE BUTTON FOR PERSONA */}
                  <button 
                    disabled={updating || selectedGoal === user?.goalPersona}
                    onClick={async () => {
                      setUpdating(true);
                      try {
                        await api.patch('/auth/onboarding', { goalPersona: selectedGoal });
                        updateUser({ goalPersona: selectedGoal });
                        setFeedback({ type: 'success', msg: `Target Goal saved as ${selectedGoal}` });
                        setTimeout(() => setFeedback(null), 3000);
                      } catch (err) {
                        setFeedback({ type: 'error', msg: 'Update failed' });
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGoal !== user?.goalPersona ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    {updating ? 'Processing...' : 'Commit Performance Goal'}
                  </button>
                </div>
              </div>

              {/* DATA SOVEREIGNTY: Exporting local logs */}
              <div className="pro-card rounded-[2.5rem] p-10 group bg-white border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3.5 bg-sky-50 text-sky-500 rounded-[1.25rem] shadow-sm"><Database size={22} /></div>
                  <h4 className="text-xl font-bold text-slate-900">Data Export</h4>
                </div>
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Download your raw performance logs for backup or external analysis.</p>
                  <button 
                    onClick={handleExportCSV}
                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all border border-slate-100"
                  >
                    <Download size={18} className="text-primary" /> Generate CSV Manifest
                  </button>
                </div>
              </div>

              {/* OPERATIONAL TARGETS: Current calculated benchmarks */}
              <div className="pro-card md:col-span-2 rounded-[2.5rem] p-10 group bg-white border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3.5 bg-primary/5 text-primary rounded-[1.25rem] shadow-sm"><Sliders size={22} /></div>
                  <h4 className="text-xl font-bold text-slate-900">Operational Intelligence Targets</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplets className="text-blue-500" size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hydration Goal</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-1">2.5L</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Active Synergy Baseline</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Coffee className="text-amber-600" size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Caffeine Cap</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-1">400mg</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Jitter Threshold Alert</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Smartphone className="text-indigo-500" size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Social Cap</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-1">2.0h</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Mindful Usage Limit</p>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><ShieldCheck size={16}/></div>
                  <p className="text-[11px] text-slate-600 font-bold leading-tight">
                    These targets are currently system-optimized for your {user?.persona || 'Balanced'} profile. Manual override coming in future update.
                  </p>
                </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;