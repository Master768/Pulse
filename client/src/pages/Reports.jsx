/**
 * REPORTS PAGE
 * 
 * This page provides a deep-dive into the user's historical performance.
 * It includes:
 * 1. PRODUCTIVITY INDEX: A large AreaChart showing score trends over time.
 * 2. HISTORICAL LOGS: A detailed list of every daily entry with risk markers.
 * 3. DATA EXPORT: Allows users to download their performance history in CSV format.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Calendar, Filter, Download, Activity, TrendingUp, Info, Search, LayoutGrid, Clock, FileText, X
} from 'lucide-react';
import api from '../utils/api';

const Reports = () => {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenJournal = (item) => {
    setSelectedLog(item);
    setJournalText(item.journalNote || '');
    setIsEditing(!item.journalNote); // Default to editing if no note exists
    setIsModalOpen(true);
  };

  const handleSaveJournal = async () => {
    if (!selectedLog) return;
    setIsSaving(true);
    try {
      await api.put(`/predictions/${selectedLog._id}/journal`, { note: journalText });
      setData(prevData => prevData.map(item => 
        item._id === selectedLog._id ? { ...item, journalNote: journalText, isJournalEdited: true } : item
      ));
      setIsEditing(false);
      // Don't close modal immediately, let user see the saved state
    } catch (err) {
      console.error("Failed to save journal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * DATA FETCHING
   * Retrieves the entire history of productivity predictions for the user.
   */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/predictions/history');
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  /**
   * EXPORT ENGINE
   * Generates a CSV file from the performance data and triggers a browser download.
   */
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    // 1. Define Column Headers
    const headers = ['Date', 'Productivity Score (%)', 'Burnout Risk', 'Persona'];
    
    // 2. Format Data Rows
    const rows = data.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.productivityScore,
      item.burnoutRisk,
      item.persona || 'N/A'
    ]);
    
    // 3. Assemble CSV Content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 4. Trigger Download via Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pulse_performance_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. LOADING STATE
  if (loading) return (
    <div className="pt-32 flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      {/* --- PAGE HEADER --- */}
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

      {/* --- CONTENT AREA --- */}
      {(!data || data.length === 0) ? (
        /* EMPTY STATE: Shown if the user hasn't logged enough days yet */
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
      /* DATA VIEW: The main analytics dashboard */
      <div className="grid grid-cols-1 gap-12">
        {/* BIG CHART: 30-Day Productivity Index */}
        <div className="pro-card rounded-3xl p-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold text-slate-900">30-Day Productivity Index</h3>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary" />
                 <div className="w-3 h-3 rounded-full bg-[#2D7D72]" />
                 <span className="text-xs font-bold text-slate-400 uppercase">Productivity</span>
              </div>
           </div>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                     <defs>
                       <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2D7D72" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#2D7D72" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                     <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '12px'}} 
                        itemStyle={{fontWeight: 700, color: '#2D7D72'}}
                        formatter={(value) => [`${Math.round(value)}%`, 'Productivity']}
                        labelFormatter={(label) => `Date: ${label}`}
                     />
                     <Area type="monotone" dataKey="productivityScore" stroke="#2D7D72" strokeWidth={4} fill="url(#colorProd)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* LOG LIST: Detailed historical view */}
        <div className="pro-card rounded-[2.5rem] p-10">
           <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-[#F0E7FF] text-[#A855F7] rounded-xl font-bold">
                 <LayoutGrid size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#111827] uppercase tracking-[0.2em]">Historical Logs</h3>
           </div>
           
           {/* Table Headers */}
           <div className="hidden md:grid grid-cols-5 px-6 mb-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.2em] opacity-60">
              <span>Date</span>
              <span className="text-center">Status</span>
              <span className="text-center">Productivity</span>
              <span className="text-center">Persona</span>
              <span className="text-right">Actions</span>
           </div>

           <div className="space-y-4">
              {data?.slice(0, 10).map((item, i) => (
                 <div key={i} className="group p-6 rounded-3xl flex flex-col md:grid md:grid-cols-5 items-center gap-4 hover:bg-[#F9FAFB] transition-all cursor-pointer border border-transparent hover:border-slate-100">
                    <span className="text-sm font-bold text-[#111827]">{new Date(item.date).toLocaleDateString()}</span>
                    
                    <div className="flex flex-col items-center">
                       {/* Color-coded risk badge */}
                       <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${
                          item.burnoutRisk === 'High' ? 'bg-[#FEE2E2] text-[#991B1B]' : 
                          item.burnoutRisk === 'Medium' ? 'bg-[#FEF3C7] text-[#92400E]' : 
                          'bg-[#DCFCE7] text-[#166534]'
                       }`}>
                          {item.burnoutRisk} Risk
                       </span>
                       {(item.isEdited || item.isJournalEdited) && (
                          <div className="mt-1.5 flex items-center gap-1 text-[9px] font-extrabold text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                             <Clock size={10} /> Edited
                          </div>
                       )}
                    </div>

                    <div className="text-center">
                       <span className="text-xl font-extrabold text-[#111827]">
                          {Math.round(item.productivityScore)}%
                       </span>
                    </div>

                    <div className="text-center">
                       <span className="text-sm font-bold text-slate-600">{item.persona || 'Steady'}</span>
                    </div>

                    <div className="w-full flex justify-end">
                       <div 
                         onClick={() => handleOpenJournal(item)}
                         className={`p-2 transition-colors cursor-pointer rounded-full hover:bg-slate-100 ${item.journalNote ? 'text-primary' : 'text-slate-300 group-hover:text-slate-400'}`}
                         title={item.journalNote ? "View Journal" : "Add Journal Note"}
                       >
                          <FileText size={18} />
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
      )}

      {/* --- JOURNAL MODAL --- */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-xl font-bold">
                 <FileText size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-xl font-bold text-slate-900">Daily Journal</h3>
                      <p className="text-sm font-bold text-slate-500">{new Date(selectedLog.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                   </div>
                   {selectedLog.isJournalEdited && (
                      <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">Edited</span>
                   )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                 <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Day Reflection</label>
                 {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                       Edit Note
                    </button>
                 )}
              </div>
              
              {isEditing ? (
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="What went well? What caused stress? Add your context here..."
                  className="w-full h-40 p-5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
                  autoFocus
                />
              ) : (
                <div className="w-full min-h-[160px] p-6 border border-slate-100 rounded-2xl bg-slate-50/50 text-slate-700 leading-relaxed italic">
                   {selectedLog.journalNote || "No reflections logged for this day yet."}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setJournalText(selectedLog.journalNote || '');
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSaveJournal}
                    disabled={isSaving}
                    className="btn-primary px-8 py-3 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-primary px-10 py-3"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;