import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, CreditCard, LogOut, Activity,
  Zap, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();

  const sections = [
    { title: "Profile Settings", icon: <User size={18} />, items: ["Personal Info", "Avatar", "Display Name"] },
    { title: "Notifications", icon: <Bell size={18} />, items: ["Push Alerts", "Email Digest", "System Updates"] },
    { title: "Security & Privacy", icon: <Shield size={18} />, items: ["Change Password", "Two-Factor Auth", "Session Log"] },
    { title: "Plan & Billing", icon: <CreditCard size={18} />, items: ["Subscription", "Payment Methods", "Invoices"] },
  ];

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-12">
        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Preferences</p>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4">
           <div className="pro-card rounded-[2rem] p-8 text-center">
              <div className="w-24 h-24 bg-primary text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-lg shadow-primary/20">
                 {user?.name?.[0] || 'U'}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{user?.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{user?.email}</p>
              <div className="inline-flex px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full mb-8">
                 {user?.persona || 'Professional'}
              </div>
              <button className="w-full btn-outline py-3 text-sm">
                 Edit Personnel Profile
              </button>
           </div>
        </div>

        {/* Settings Grid */}
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section, idx) => (
                 <div key={idx} className="pro-card rounded-3xl p-8 group">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 group-hover:text-primary transition-colors">{section.icon}</div>
                       <h4 className="text-lg font-bold text-slate-900">{section.title}</h4>
                    </div>
                    <div className="space-y-4">
                       {section.items.map((item, idy) => (
                          <button key={idy} className="w-full flex justify-between items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                             {item}
                             <ChevronRight size={14} className="text-slate-200" />
                          </button>
                       ))}
                    </div>
                 </div>
              ))}
           </div>

           {/* Logout Section */}
           <div className="pro-card rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-red-100 bg-red-50/10">
              <div>
                 <h4 className="text-xl font-bold text-slate-900 mb-1">Session Management</h4>
                 <p className="text-sm text-slate-500">Log out of your current session on this device.</p>
              </div>
              <button onClick={logout} className="px-10 py-4 bg-error text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-3 shadow-lg shadow-error/10">
                 <LogOut size={20} /> Exit System
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;