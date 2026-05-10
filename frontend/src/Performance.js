import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Award, Zap, TrendingUp, BarChart3, 
    Star, ShieldCheck, Activity, Target 
} from 'lucide-react';

const Performance = () => {
    const [metrics, setMetrics] = useState([]);
    const [stats, setStats] = useState({ avg_rating: 0, total_reviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token'); // Ensure this matches your login storage name
            const headers = { Authorization: `Bearer ${token}` };
            
            try {
                const [mRes, sRes] = await Promise.all([
                    axios.get('http://127.0.0', { headers }),
                    axios.get('http://127.0.0', { headers })
                ]);
                setMetrics(mRes.data);
                setStats(sRes.data);
                setLoading(false);
            } catch (err) {
                console.error("PMS Fetch Error:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="bg-[#0b1120] min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="p-8 bg-[#0b1120] min-h-screen text-slate-300 font-sans">
            {/* 1. Header Section */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-blue-500 text-xs tracking-[0.2em] uppercase font-black mb-1">— PERFORMANCE APPRAISAL</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">Talent Analytics</h1>
                </div>
                <div className="flex gap-4">
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-bold border border-white/5 transition">
                        Export Report
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition">
                        + Review
                    </button>
                </div>
            </div>

            {/* 2. Key Performance Indicators (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard 
                    title="Avg Team Rating" 
                    value={`${Number(stats.avg_rating || 0).toFixed(1)}`} 
                    sub="/ 5.0"
                    icon={<Star size={20} className="text-blue-400" />} 
                />
                <StatCard 
                    title="Productivity Level" 
                    value={`${stats.avg_productivity || 0}%`} 
                    sub="Overall"
                    icon={<Zap size={20} className="text-amber-400" />} 
                />
                <StatCard 
                    title="Reviews Processed" 
                    value={stats.total_reviews || 0} 
                    sub="Current Cycle"
                    icon={<ShieldCheck size={20} className="text-emerald-400" />} 
                />
            </div>

            {/* 3. Detailed Competency Table */}
            <div className="bg-[#111827] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-white">Employee Metric Tracking</h2>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="p-6">Consultant</th>
                                <th className="p-6">Technical Skill</th>
                                <th className="p-6">Reliability</th>
                                <th className="p-6">Overall Competency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {metrics.length > 0 ? metrics.map((m) => (
                                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs">
                                                {m.employee_name ? m.employee_name[0] : 'E'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white group-hover:text-blue-400 transition">{m.employee_name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ID: #{m.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-black text-slate-300">{m.technical_skills}</span>
                                        <span className="text-xs text-slate-600 font-bold ml-1">/ 5</span>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-black text-slate-300">{m.reliability}</span>
                                        <span className="text-xs text-slate-600 font-bold ml-1">/ 5</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden max-w-[150px]">
                                                <div 
                                                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-full transition-all duration-1000 ease-out" 
                                                    style={{ width: `${(m.overall_score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-black text-white text-xs bg-slate-800 px-2 py-1 rounded border border-white/5">
                                                {m.overall_score}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-500 font-bold text-xs uppercase tracking-[0.2em] italic">
                                        No performance data indexed in the mainframe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Helper StatCard Component
const StatCard = ({ title, value, sub, icon }) => (
    <div className="bg-[#111827] p-6 rounded-3xl border border-white/5 shadow-2xl flex justify-between items-center hover:scale-[1.02] transition-transform duration-300 cursor-default">
        <div>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-black text-white">{value}</h2>
                <span className="text-xs text-slate-600 font-bold">{sub}</span>
            </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl border border-white/10 shadow-inner">
            {icon}
        </div>
    </div>
);

export default Performance;
