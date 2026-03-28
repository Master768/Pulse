import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, TrendingUp, AlertCircle, 
  Calendar, Settings, ArrowUpRight, Brain, Sparkles, 
  Info, LayoutGrid, CheckCircle2, PlusCircle
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BenchmarkCard from '../components/BenchmarkCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="pt-32 flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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

  const getRiskStatus = (risk) => {
    if (risk === 'High') return { color: 'text-error', bg: 'bg-error/5', border: 'border-error/10', icon: <AlertCircle size={16} /> };
    if (risk === 'Medium') return { color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/10', icon: <Info size={16} /> };
    return { color: 'text-success', bg: 'bg-success/5', border: 'border-success/10', icon: <CheckCircle2 size={16} /> };
  };

  const risk = getRiskStatus(data.latest.burnoutRisk);

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
           <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Overview</p>
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{getGreeting()}, {user?.name.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
              <Calendar className="text-slate-400" size={18} />
              <span className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
           </div>
           <button onClick={() => navigate('/settings')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
              <Settings size={20} />
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Core Productivity Card */}
        <div className="md:col-span-8 pro-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10">
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
                <TrendingUp size={14} /> Today's Insight
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">You're performing at your peak</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Based on your latest logs, your productivity is looking strong. Your focus levels and recovery are currently in optimal balance.
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${risk.bg} ${risk.color} ${risk.border}`}>
                 {risk.icon}
                 <span className="text-xs font-bold uppercase tracking-wider">{data.latest.burnoutRisk} Burnout Risk</span>
              </div>
           </div>
        </div>

        {/* Persona Card */}
        <div className="md:col-span-4 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                 <div className="p-3 bg-white/10 rounded-xl"><Sparkles size={24} className="text-amber-400" /></div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">System Profile</span>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Performance Style</p>
              <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                {data.latest.persona || 'Steady Performer'}
              </h2>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "70%" }}
                    className="h-full bg-primary" 
                 />
              </div>
           </div>
           <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Factors Summary */}
        <div className="md:col-span-8 pro-card rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                 <h4 className="text-lg font-bold text-slate-900">Positive Factors</h4>
              </div>
              <div className="space-y-3">
                 {data.latest.topPositiveFactors.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                       <CheckCircle2 size={16} className="text-green-500" />
                       <span className="text-sm font-semibold text-slate-600">{f}</span>
                    </div>
                 ))}
              </div>
           </div>
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
                 <h4 className="text-lg font-bold text-slate-900">Challenges</h4>
              </div>
              <div className="space-y-3">
                 {data.latest.topNegativeFactors.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                       <AlertCircle size={16} className="text-red-400" />
                       <span className="text-sm font-semibold text-slate-600">{f}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Benchmark Card */}
        <div className="md:col-span-4 h-full">
           <BenchmarkCard />
        </div>

        {/* Seven Day Trend */}
        <div className="md:col-span-12 pro-card rounded-3xl p-8 mb-10">
           <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">7-Day Trend</h4>
              <TrendingUp size={18} className="text-green-500" />
           </div>
           <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data.summary.trends.slice(-7)}>
                    <defs>
                      <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="productivityScore" 
                      stroke="#2563EB" 
                      strokeWidth={2} 
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