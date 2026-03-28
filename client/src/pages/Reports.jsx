import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Calendar, Filter, Download, Activity, TrendingUp, Info, Search
} from 'lucide-react';
import api from '../utils/api';

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/predictions/history');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    // Headers
    const headers = ['Date', 'Productivity Score (%)', 'Burnout Risk', 'Persona'];
    
    // Rows
    const rows = data.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.productivityScore,
      item.burnoutRisk,
      item.persona || 'N/A'
    ]);
    
    // Combine
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pulse_performance_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="pt-32 flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
           <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Analytics</p>
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Performance History</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleExportCSV}
             disabled={!data || data.length === 0}
             className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <Download size={18} /> Export CSV
           </button>
        </div>
      </div>

      {(!data || data.length === 0) ? (
        <div className="pro-card p-12 rounded-3xl text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-12">
          <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
             <Calendar size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No data available or provided.</h2>
          <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm">
             Your performance history tracking requires benchmark data. Continue completing your daily audits to populate this visual index!
          </p>
          <button onClick={() => window.location.href='/log'} className="btn-primary px-8 py-3">
             Log Today's Performance
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-12">
        <div className="pro-card rounded-3xl p-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold text-slate-900">30-Day Productivity Index</h3>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary" />
                 <span className="text-xs font-bold text-slate-400 uppercase">Productivity</span>
              </div>
           </div>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                       tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="productivityScore" stroke="#2563EB" strokeWidth={3} fill="url(#colorProd)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div>
           <h3 className="text-2xl font-bold text-slate-900 mb-8">Detailed History</h3>
           <div className="space-y-4">
              {data?.slice(0, 10).map((item, i) => (
                 <div key={i} className="pro-card p-6 rounded-2xl flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-8">
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                          <p className="text-base font-bold text-slate-900">{new Date(item.date).toLocaleDateString()}</p>
                       </div>
                       <div className="h-8 w-px bg-slate-100" />
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk</p>
                          <span className={`text-xs font-bold ${item.burnoutRisk === 'High' ? 'text-red-500' : 'text-green-500'}`}>{item.burnoutRisk}</span>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-8">
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                          <p className="text-2xl font-bold text-primary tracking-tight">{item.productivityScore}%</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Reports;