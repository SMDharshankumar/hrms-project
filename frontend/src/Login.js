import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import axios from 'axios';
import { Lock, Mail, ShieldCheck, Loader2, UserPlus } from 'lucide-react'; // Added UserPlus

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/token/', {
                username: username.trim(), 
                password: password
            });

            localStorage.setItem('access_token', res.data.access);
            alert("Establish Connection: Access Granted.");
            navigate('/dashboard');
        } catch (err) {
            console.error("--- LOGIN FAILED ---");
            if (err.response) {
                alert("Access Denied: Invalid Credentials.");
            } else {
                alert("Connection Error: Backend server is unreachable.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 font-sans">
            <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0f172a] p-12 shadow-2xl shadow-black/50 text-white">
                
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c5a059]/10 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">
                        HRMS <span className="text-[#c5a059]">Enterprise</span>
                    </h1>
                    <div className="mt-2 h-0.5 w-10 bg-[#c5a059] mx-auto rounded-full opacity-30"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">Authorization ID</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-[#c5a059] transition-colors" />
                            <input 
                                type="text" 
                                required
                                autoComplete="username"
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="Corporate Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold ml-1">Secure Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-[#c5a059] transition-colors" />
                            <input 
                                type="password" 
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-white/5 bg-black/40 py-4 pl-12 pr-4 text-sm text-white placeholder-slate-700 outline-none focus:border-[#c5a059]/30 transition-all" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-6 w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a18247] py-4 text-xs font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#c5a059]/10 hover:shadow-[#c5a059]/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Establish Connection"}
                    </button>
                </form>

                {/* --- REGISTRATION LINK SECTION --- */}
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4 font-bold">
                        New Personnel?
                    </p>
                    <Link 
                        to="/register" 
                        className="inline-flex items-center gap-2 text-[#c5a059] hover:text-[#e2bc75] transition-colors text-xs font-bold uppercase tracking-widest group"
                    >
                        <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
                        Request Access / Register
                    </Link>
                </div>

                <div className="mt-12 text-center opacity-30">
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em]">Version 2.0.6 • Encrypted Gateway</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
