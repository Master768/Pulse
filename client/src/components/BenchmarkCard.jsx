/**
 * BENCHMARK CARD COMPONENT
 * 
 * This component visualizes how the user compares to their peers (same persona cluster).
 * It handles the 'Locked' state for new users and renders dynamic progress bars 
 * based on percentile data fetched from the API.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Zap, Clock, ShieldAlert, Lock } from 'lucide-react';
import api from '../utils/api';

const BenchmarkCard = () => {
  // --- STATE ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * DATA FETCHING
   * Retrieves the comparison metrics from the backend.
   */
  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        const res = await api.get('/benchmark');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch benchmark data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmark();
  }, []);

  // 1. LOADING STATE: Shown while waiting for API response
  if (loading) {
    return (
      <div className="pro-card rounded-3xl p-8 flex items-center justify-center min-h-[250px] animate-pulse">
        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. LOCKED STATE: Benchmarks require at least 7 days of user logs for accuracy.
  if (!data?.is_available) {
    return (
      <div className="pro-card rounded-3xl p-10 bg-slate-50/50 border-dashed text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
           <Lock className="text-slate-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Peer Benchmark Locked</h3>
        <p className="text-sm text-slate-500 max-w-xs">Benchmark unlocks after 7 days of logging. Keep tracking your daily stats to unlock peer comparisons.</p>
      </div>
    );
  }

  // 3. METRIC CONFIG: Maps API keys to UI labels and icons
  const metrics = [
    { label: 'Sleep', value: data.metrics.sleep_percentile, icon: <Clock size={16} /> },
    { label: 'Productivity', value: data.metrics.productivity_percentile, icon: <TrendingUp size={16} /> },
    { label: 'Focus Quality', value: data.metrics.focus_percentile, icon: <Zap size={16} /> },
    { label: 'Burnout Risk', value: data.metrics.burnout_percentile, icon: <ShieldAlert size={16} /> } 
  ];

  /**
   * DYNAMIC THEMING
   * Assigns colors based on performance level.
   * Teal = High Performance (Top 40%)
   * Amber = Average
   * Coral = Below Average
   */
  const getColor = (val) => {
    if (val >= 60) return { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' };
    if (val >= 40) return { bg: 'bg-amber-400', text: 'text-amber-600', light: 'bg-amber-50' };
    return { bg: 'bg-coral-500', text: 'text-coral-500', light: 'bg-coral-50' }; 
  };

  return (
    <div className="pro-card rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/20 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-md cursor-help">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Peer Benchmark</h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">{data.persona}</span>
        </div>

        {/* METRIC LIST */}
        <div className="space-y-6 flex-1">
          {metrics.map((m, i) => {
            const colors = getColor(m.value);
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className={`p-1.5 rounded-md ${colors.light} ${colors.text}`}>{m.icon}</span> 
                    {m.label} <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider ml-1">vs peers</span>
                  </span>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    Top {100 - (m.value || 0)}%
                  </span>
                </div>
                {/* PROGRESS BAR */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value || 0}%` }}
                    transition={{ duration: 1.5, delay: i * 0.15 + 0.2, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colors.bg}`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Better than <span className={`font-bold ${colors.text}`}>{m.value || 0}%</span> of users like you
                </p>
              </div>
            );
          })}
        </div>
        
        {/* FOOTNOTE */}
        <div className="mt-8 pt-5 border-t border-slate-100/80 text-center">
           <p className="text-xs text-slate-400 font-medium">Compared against <span className="font-bold text-slate-500">{data.metrics?.cluster_size || 0}</span> anonymous users in your cluster</p>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkCard;

