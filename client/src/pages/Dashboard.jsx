/**
 * DASHBOARD PAGE
 * 
 * This is the primary Command Center for the user. It aggregates:
 * 1. REAL-TIME SCORE: Circular progress bar showing the latest Pulse Score.
 * 2. ML INSIGHTS: Textual analysis of performance and burnout risk.
 * 3. FACTOR ANALYSIS: Breakdown of what boosted or lowered the today's score.
 * 4. PEER BENCHMARK: Side-by-side comparison with similar users.
 * 5. TREND CHART: Sparkline showing the last 7 days of productivity.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, TrendingUp, AlertCircle, 
  Calendar, Settings, Brain, Sparkles, 
  Info, CheckCircle2, PlusCircle
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BenchmarkCard from '../components/BenchmarkCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * DATA ORCHESTRATION
   * We need data from two different backend routes. Promise.all allows us 
   * to fetch them simultaneously so the page loads faster.
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [latestRes, reportRes] = await Promise.all([
          api.get('/predictions/latest'),
          api.get('/reports/summary')
        ]);
        setData({
          latest: latestRes.data.data,
          summary: reportRes.data.data
        });
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 1. LOADING STATE
  if (loading) return (
    <div className="pt-32 flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  /**
   * HELPER: GREETING ENGINE
   * Provides a contextual greeting based on the current time of day.
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // 2. EMPTY STATE: If no logs exist, guide the user to their first log.
  if (!data?.latest) {
    return (
      <div className="pt-40 pb-24 px-6 max-w-4xl mx-auto">
        <div className="pro-card rounded-3xl p-16 text-center">
           <div className="inline-flex p-6 bg-primary/5 text-primary rounded-2xl mb-8">
              <Brain size={48} />
           </div>
           <h1 className="text-4xl font-bold text-slate-900 mb-6">Welcome, {user?.name.split(' ')[0]}</h1>
           <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto">
             You haven't logged any data yet. Start your first daily log to begin receiving productivity insights.
           </p>
           <button 
             onClick={() => navigate('/log')}
             className="btn-primary flex items-center gap-3 mx-auto"
           >
             Get Started <PlusCircle size={20} />
           </button>
        </div>
      </div>
    );
  }

  /**
   * HELPER: RISK STATUS MAPPING
   * Converts a burnout risk string (e.g., "High") into UI styles and icons.
   */
  const getRiskStatus = (risk) => {
    if (risk === 'High') return { color: 'text-error', bg: 'bg-error/5', border: 'border-error/10', icon: <AlertCircle size={16} /> };
    if (risk === 'Medium') return { color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/10', icon: <Info size={16} /> };
    return { color: 'text-success', bg: 'bg-success/5', border: 'border-success/10', icon: <CheckCircle2 size={16} /> };
  };

  /**
   * HELPER: INSIGHT LOGIC
   * Generates a context-aware heading and description based on the Pulse Score and Burnout Risk.
   */
  const getInsightContent = (score, risk) => {
    if (score >= 80) {
      if (risk === 'High') return { 
        heading: "High Output, High Cost", 
        text: "You're achieving a lot, but your overhead is dangerous. Prioritize 15-minute disconnects to prevent a crash."
      };
      return {
        heading: "You're in Peak Flow",
        text: "Your productivity is exceptional and your recovery is optimal. This is your golden zone—maintain these rituals."
      };
    } else if (score >= 50) {
      if (risk === 'High' || risk === 'Medium') return {
        heading: "Warning Signs Detected",
        text: "Efficiency is moderate, but burnout markers are rising. Consider ending your day early to recharge."
      };
      return {
        heading: "Steady & Sustainable",
        text: "You're maintaining a healthy, balanced output. There's room to scale up deep focus sessions if needed."
      };
    } else {
      if (risk === 'High') return {
        heading: "System Overload",
        text: "Critical burnout risk detected alongside low output. Stop all deep work and prioritize sleep immediately."
      };
      return {
        heading: "Recovery in Progress",
        text: "Output is low today, but your risk is managed. Use this time for low-intensity admin or planning."
      };
    }
  };
  const risk = getRiskStatus(data.latest.burnoutRisk);
  const insight = getInsightContent(data.latest.productivityScore, data.latest.burnoutRisk);

  // --- TRAJECTORY ENGINE ---
  const getTrajectory = () => {
    const trends = data.summary.trends.slice(-3);
    if (trends.length < 2) return null;
    const last = trends[trends.length - 1].productivityScore;
    const prev = trends[trends.length - 2].productivityScore;
    const diff = last - prev;
    
    if (diff < -15 && data.latest.burnoutRisk === 'High') {
      return { status: 'Danger', msg: 'Sharp decline detected. You are trending towards a burnout crash.', color: 'text-rose-500', bg: 'bg-rose-50' };
    }
    if (diff > 10 && data.latest.burnoutRisk === 'Low') {
      return { status: 'Improving', msg: 'Productivity is scaling sustainably. Keep this momentum!', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    }
    return null;
  };

  const trajectory = getTrajectory();



  const goalSuggestions = {
    'Balanced Optimizer': [
      'Maintain consistent sleep/wake times to stabilize rhythm.',
      'Schedule 15-minute "unplugged" breaks every 3 hours.',
      'Prioritize hydration (2.5L+) to avoid energy crashes.'
    ],
    'High Performer': [
      'Schedule 90-minute deep work blocks with zero notifications.',
      'Limit "Social" screen time to under 45 mins on work days.',
      'Ensure 7.5h+ sleep to facilitate neural recovery.'
    ],
    'Under Pressure': [
      'Strictly follow 25/5 Pomodoro rhythm to prevent fatigue.',
      'Shift to low-intensity tasks if Burnout Risk hits Medium.',
      'Practice 5-minute deep breathing between focus sessions.'
    ],
    'Restricted Sleep': [
      'Front-load complex tasks within 3 hours of waking up.',
      'Use strategic 20-minute power naps to offset deficit.',
      'Cap caffeine at 400mg and stop 8h before bed.'
    ]
  };

  const suggestions = goalSuggestions[user?.goalPersona] || goalSuggestions['Balanced Optimizer'];

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in text-[#111827]">
      {/* --- TRAJECTORY WARNING --- */}
      {trajectory && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-6 rounded-2xl flex items-center gap-4 border shadow-sm ${trajectory.bg}`}
        >
          <div className={`p-3 rounded-xl bg-white shadow-sm ${trajectory.color}`}>
            <AlertCircle size={24} />
          </div>
          <div>
             <h4 className={`text-sm font-black uppercase tracking-widest ${trajectory.color}`}>{trajectory.status} Trajectory</h4>
             <p className="text-slate-600 font-bold">{trajectory.msg}</p>
          </div>
        </motion.div>
      )}

      {/* --- DASHBOARD HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
             <p className="text-sm font-bold text-primary uppercase tracking-wider">Overview</p>
             {user?.streakCount > 0 && (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                 <Sparkles size={12} /> {user.streakCount} Day Balanced Streak
               </div>
             )}
           </div>
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{getGreeting()}, {user?.name.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
              <Calendar className="text-slate-400" size={18} />
              <span className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
           </div>
           <button onClick={() => navigate('/settings')} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-sm group">
              <Settings size={18} className="text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm font-bold uppercase tracking-wider">Settings</span>
           </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* PROGRESS CIRCLE CARD */}
        <div className="md:col-span-8 pro-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 border border-slate-100/50 shadow-sm">
           <div className="relative w-56 h-56 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="50%" cy="50%" r="90" className="stroke-current text-slate-50" strokeWidth="16" fill="none" />
                 <motion.circle 
                    cx="50%" cy="50%" r="90" 
                    className="stroke-current text-primary" strokeWidth="16" fill="none" 
                    strokeDasharray="565" 
                    initial={{ strokeDashoffset: 565 }}
                    animate={{ strokeDashoffset: 565 - (565 * data.latest.productivityScore / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round" 
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <p className="text-5xl font-bold text-slate-900">{Math.round(data.latest.productivityScore)}%</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Efficiency</p>
              </div>
           </div>
           <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold mb-4">
                <Zap size={14} /> Today's Insight
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{insight.heading}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                {insight.text}
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${risk.bg} ${risk.color} ${risk.border}`}>
                 {risk.icon}
                 <span className="text-xs font-bold uppercase tracking-wider">{data.latest.burnoutRisk} Burnout Risk</span>
              </div>
           </div>
        </div>

          {/* PERSONA CARD: Categorizes behavioral style */}
          <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-card relative overflow-hidden group border border-primary/10" style={{ backgroundColor: '#ffffff' }}>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300"><Sparkles size={24} /></div>
                   <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 opacity-70">Behavior Profile</span>
                </div>
                <div className="mb-6">
                  <p className="text-[10px] font-extrabold text-[#111827] uppercase tracking-[0.2em] mb-2 opacity-60">Status: {data.latest.persona}</p>
                  <h2 className="text-3xl font-extrabold text-[#111827] mb-2 leading-tight">
                    {data.latest.persona || 'Steady Performer'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {data.latest.personaReason || "No anomalies detected in your performance entropy today."}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Goal</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full bg-primary ${data.latest.persona === user?.goalPersona ? 'animate-ping' : ''}`} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{user?.goalPersona || 'Balanced Optimizer'}</span>
                      </div>
                   </div>

                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Roadmap to your Goal</p>
                      <div className="space-y-3">
                        {suggestions.map((s, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="mt-1 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                            <p className="text-[11px] font-medium text-slate-500 leading-tight">{s}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
             <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>



        {/* --- POSITIVE AND NEGATIVE IMPACT FACTORS --- */}
        <div className="md:col-span-8 pro-card rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
           {/* BOOSTERS */}
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                 <h4 className="text-lg font-bold text-slate-900">Positive Factors</h4>
              </div>
              <div className="space-y-4">
                 {(data.latest.topPositiveFactorsDetailed && data.latest.topPositiveFactorsDetailed.length > 0) ? (
                    data.latest.topPositiveFactorsDetailed.map((f, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all duration-300">
                           <div className="mt-1 p-1 bg-green-100 rounded-full text-green-600 flex-shrink-0">
                              <CheckCircle2 size={14} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                 <p className="text-sm font-bold text-slate-900">{f.label}</p>
                                 {f.impact && (
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-green-100/50 text-green-700 rounded-full border border-green-200 uppercase tracking-tighter">
                                       +{f.impact} pts
                                    </span>
                                 )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.insight}</p>
                           </div>
                        </div>
                    ))
                 ) : (
                    <p className="text-sm text-slate-400 italic">No significant boosters found yet.</p>
                 )}
              </div>
           </div>
           {/* CHALLENGES */}
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
                 <h4 className="text-lg font-bold text-slate-900">Challenges</h4>
              </div>
              <div className="space-y-4">
                 {(data.latest.topNegativeFactorsDetailed && data.latest.topNegativeFactorsDetailed.length > 0) ? (
                    data.latest.topNegativeFactorsDetailed.map((f, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-red-50/30 border border-red-100/50 rounded-2xl group hover:bg-white hover:shadow-md transition-all duration-300">
                           <div className="mt-1 p-1 bg-red-100 rounded-full text-red-500 flex-shrink-0">
                              <AlertCircle size={14} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                 <p className="text-sm font-bold text-slate-900">{f.label}</p>
                                 {f.impact && (
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-red-100/30 text-red-700 rounded-full border border-red-200 uppercase tracking-tighter">
                                       {f.impact} pts
                                    </span>
                                 )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.insight}</p>
                           </div>
                        </div>
                    ))
                 ) : (
                    <p className="text-sm text-slate-400 italic">No significant challenges detected.</p>
                 )}
              </div>
           </div>
        </div>

        {/* PEER COMPARISON PANEL */}
        <div className="md:col-span-4 h-full">
           <BenchmarkCard />
        </div>

        {/* --- TREND LINE: 7 Day History Visualization --- */}
        <div className="md:col-span-12 pro-card rounded-3xl p-8 mb-10">
           <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">7-Day Trend</h4>
              <TrendingUp size={18} className="text-green-500" />
           </div>
           <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                 {/* Slice to ensure we only show the last 7 entries for the sparkline */}
                 <AreaChart data={data.summary.trends.slice(-7)}>
                    <defs>
                       <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2D7D72" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#2D7D72" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="productivityScore" 
                      stroke="#2D7D72" 
                      strokeWidth={3} 
                      fill="url(#chartColor)" 
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <p className="text-sm text-slate-500 font-medium">Your productivity is stable this week.</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;