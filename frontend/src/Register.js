import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from './api.js';
import { ShieldPlus, User, Mail, Lock, UserCheck, Loader2, ArrowLeft } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await API.post('register/', formData);
            alert("Registration Successful: Identity Verified.");
            navigate('/login');
        } catch (err) {
            console.error("--- REGISTRATION FAILED ---");
            
            if (err.response) {
                // Shows specific Django errors (e.g., "Username already taken")
                alert(`Access Denied: ${JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                // Connection failed (URL or Server issues)
                alert("Connection Error: Security Gateway Unreachable. Ensure your Django server is running.");
            } else {
                alert("System Error: Request could not be initialized.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 font-sans">
            <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0f172a] p-12 shadow-2xl shadow-black/50 text-white">
                
                {/* Navigation Back */}
                <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-[#c5a059] transition-colors text-[10px] uppercase font-bold tracking-widest mb-8">
                    <ArrowLeft size={14} /> Back to Gateway
                </Link>

                <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c5a059]/10 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                        <ShieldPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">
                        Personnel <span className="text-[#c5a059]">Onboarding</span>
                    </h1>
                    <div className="mt-2 h-0.5 w-10 bg-[#c5a059] mx-auto rounded-full opacity-30"></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Username */}
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">Establish Identity (Username)</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-[#c5a059] transition-colors" />
                            <input 
                                type="text" required
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="Corporate Username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">Comms Channel (Email)</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-[#c5a059] transition-colors" />
                            <input 
                                type="email" required
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="name@enterprise.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Names Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">First Name</label>
                            <input 
                                type="text"
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 px-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="First"
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">Last Name</label>
                            <input 
                                type="text"
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 px-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="Last"
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">Secure Keyphrase</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-[#c5a059] transition-colors" />
                            <input 
                                type="password" required
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-6 w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a18247] py-4 text-xs font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#c5a059]/10 hover:shadow-[#c5a059]/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <div className="flex items-center gap-2">
                                <UserCheck size={16} /> Finalize Enrollment
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center opacity-30">
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em]">HRMS Global Identity Protocol 2.0.6</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
