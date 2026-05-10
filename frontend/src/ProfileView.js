import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Shield, Save, Clock, Briefcase } from 'lucide-react';

const ProfileView = ({ data, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...data });

    // Sync state when data prop changes
    useEffect(() => {
        setEditForm({ ...data });
    }, [data]);

    if (!data) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-[#c5a059] font-black tracking-[0.5em] animate-pulse uppercase">
                    Accessing Secure Core...
                </div>
            </div>
        );
    }

    const handleSave = () => {
        onUpdate(editForm);
        setIsEditing(false);
    };

    return (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- SYSTEM BREADCRUMB --- */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">— System Operations</p>
            <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- MAIN IDENTITY CARD --- */}
                <div className="lg:col-span-2 bg-[#111827]/50 border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                    {/* Visual Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#c5a059]/10 blur-[100px] rounded-full"></div>

                    <div className="relative z-10 flex flex-col items-center md:items-start md:flex-row gap-8 mb-12">
                        {/* Avatar with dynamic initials */}
                        <div className="w-24 h-24 bg-gradient-to-br from-[#c5a059] to-[#8e6d31] rounded-2xl flex items-center justify-center text-3xl font-black text-slate-900 shadow-xl">
                            {data.first_name?.[0]}{data.last_name?.[0]}
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-4xl font-bold text-white mb-2">
                                {isEditing ? (
                                    <div className="flex gap-2 justify-center md:justify-start">
                                        <input 
                                            className="bg-white/5 border border-[#c5a059]/30 rounded px-2 py-1 text-2xl w-full max-w-[150px] outline-none focus:border-[#c5a059] text-white" 
                                            value={editForm.first_name || ''} 
                                            onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                        />
                                        <input 
                                            className="bg-white/5 border border-[#c5a059]/30 rounded px-2 py-1 text-2xl w-full max-w-[150px] outline-none focus:border-[#c5a059] text-white" 
                                            value={editForm.last_name || ''} 
                                            onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                        />
                                    </div>
                                ) : `${data.first_name} ${data.last_name}`}
                            </h2>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a059] font-black">
                                {data.designation || "AUTHORIZED PERSONNEL"} • {data.department || "General Operations"}
                            </p>
                        </div>

                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all uppercase text-[10px] tracking-widest shadow-lg transform active:scale-95 border ${
                                isEditing 
                                ? 'bg-green-600 text-white border-green-500 shadow-green-900/20' 
                                : 'bg-white/5 text-white hover:bg-white/10 border-white/10'
                            }`}
                        >
                            {isEditing ? <span className="flex items-center gap-2"><Save size={14}/> Push Changes</span> : 'Modify Profile'}
                        </button>
                    </div>

                    {/* --- CORE DATA GRID --- */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                <Mail size={12}/> Official Email
                            </p>
                            {isEditing ? (
                                <input 
                                    className="bg-white/5 border border-[#c5a059]/30 text-white w-full rounded p-2 outline-none focus:border-[#c5a059] text-sm"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                />
                            ) : <p className="text-white font-bold">{data.email}</p>}
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                <Shield size={12}/> Security Status
                            </p>
                            <p className="text-[#c5a059] font-bold uppercase tracking-widest text-xs italic">
                                {data.current_status || "Active Duty"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- METRICS COLUMN --- */}
                <div className="space-y-6">
                    <div className="bg-[#111827]/50 border border-white/5 p-8 rounded-3xl text-center shadow-xl">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-6 font-bold">Engagement Metrics</p>
                        <div className="space-y-4">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-[#c5a059]/20 transition-colors group">
                                <p className="text-3xl font-black text-white group-hover:text-[#c5a059] transition-colors">
                                    {data.attendances?.length || 0}
                                </p>
                                <p className="text-[9px] uppercase tracking-widest text-[#c5a059] mt-1 font-bold">Days Present</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-[#c5a059]/20 transition-colors group">
                                <p className="text-3xl font-black text-white group-hover:text-slate-300 transition-colors">
                                    {data.leaves?.length || 0}
                                </p>
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Authorized Leaves</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
