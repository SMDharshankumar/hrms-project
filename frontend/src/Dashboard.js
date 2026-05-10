import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
    Users, LogOut, ShieldCheck, Plus, Briefcase, X, Trash2,
    Pencil, Search, Download, Clock, Check, AlertCircle,
    TrendingUp, UserCircle, Monitor,
    UserPlus, FileCheck, Upload, Filter, Send, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────
//  WHY: Removed unused imports (AssetModal, ProfileView, Package,
//  Laptop, Smartphone) to keep the component clean. These were
//  imported but never referenced anywhere in the JSX.
// ─────────────────────────────────────────────────────────────

const Dashboard = () => {

    // ── STATE ────────────────────────────────────────────────
    // WHY: All useState hooks MUST stay at the top level of the
    // component, in a fixed order. React tracks them by position.
    const [employees,       setEmployees]       = useState([]);
    const [leaves,          setLeaves]           = useState([]);
    const [candidates,      setCandidates]       = useState([]);
    const [assets,          setAssets]           = useState([]);
    const [onboarding,      setOnboarding]       = useState([]);
    const [metrics,         setMetrics]          = useState([]);
    const [myProfile,       setMyProfile]        = useState(null);
    const [stats,           setStats]            = useState({ total_payout: 0, avg_salary: 0, total_staff: 0 });
    const [perfStats,       setPerfStats]        = useState({ avg_rating: 0, avg_productivity: 0, total_reviews: 0 });
    const [activeTab,       setActiveTab]        = useState('workforce');
    const [searchTerm,      setSearchTerm]       = useState('');
    const [showModal,       setShowModal]        = useState(false);
    const [showGoalModal,   setShowGoalModal]    = useState(false);
    const [editingId,       setEditingId]        = useState(null);
    const [selectedFile,    setSelectedFile]     = useState(null); // kept for resume upload
    const [formData,        setFormData]         = useState({
        first_name: '', last_name: '', email: '',
        department: '', designation: '', salary: '',
        role: '', phone: '', resume_url: '', notes: '',
        asset_name: '', model: '', status: 'available'
    });
    const [metricFormData, setMetricFormData] = useState({
        employee: '', technical_skills: 3, productivity: 3,
        reliability: 3, communication: 3
    });

    const navigate = useNavigate();

    // ── API ENDPOINTS ────────────────────────────────────────
    const API_BASE       = 'http://localhost:8000/api/employees/';
    const STATS_URL      = 'http://localhost:8000/api/payroll/stats/';
    const LEAVE_URL      = 'http://localhost:8000/api/leaves/';
    const CANDIDATE_URL  = 'http://localhost:8000/api/candidates/';
    const ASSET_URL      = 'http://localhost:8000/api/assets/';
    const MY_PROFILE_URL = 'http://localhost:8000/api/employees/me/';
    const ONBOARDING_URL = 'http://localhost:8000/api/onboarding/';
    const METRIC_URL     = 'http://localhost:8000/api/metrics/';
    const PERF_STATS_URL = 'http://localhost:8000/api/performance/stats/';

    // ── DATA FETCHING ────────────────────────────────────────
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [
                empRes, statsRes, leaveRes, candRes,
                assetRes, profileRes, onboardRes, metricRes, perfStatsRes
            ] = await Promise.all([
                axios.get(API_BASE,       { headers }),
                axios.get(STATS_URL,      { headers }),
                axios.get(LEAVE_URL,      { headers }),
                axios.get(CANDIDATE_URL,  { headers }).catch(() => ({ data: [] })),
                axios.get(ASSET_URL,      { headers }).catch(() => ({ data: [] })),
                axios.get(MY_PROFILE_URL, { headers }),
                axios.get(ONBOARDING_URL, { headers }).catch(() => ({ data: [] })),
                axios.get(METRIC_URL,     { headers }).catch(() => ({ data: [] })),
                axios.get(PERF_STATS_URL, { headers }).catch(() => ({
                    data: { avg_rating: 0, avg_productivity: 0, total_reviews: 0 }
                }))
            ]);

            setEmployees(empRes.data);
            setStats(statsRes.data);
            setLeaves(leaveRes.data);
            setCandidates(candRes.data);
            setAssets(assetRes.data);
            setMyProfile(profileRes.data);
            setOnboarding(onboardRes.data);
            setMetrics(metricRes.data);
            setPerfStats(perfStatsRes.data);

        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => { fetchData(); }, [navigate]);

    // ── PAYROLL HELPERS ──────────────────────────────────────
    const departmentData = employees.reduce((acc, emp) => {
        const dept = emp.department || 'Unassigned';
        const existing = acc.find(d => d.name === dept);
        if (existing) existing.value += Number(emp.salary || 0);
        else acc.push({ name: dept, value: Number(emp.salary || 0) });
        return acc;
    }, []).sort((a, b) => b.value - a.value);

    const maxSpending = Math.max(...departmentData.map(d => d.value), 1);

    // ── ATS HELPERS ──────────────────────────────────────────
    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            alert(`Parsing Resume: ${file.name}... (AI Logic Integration Point)`);
        }
    };

    const exportCandidates = () => {
        if (candidates.length === 0) return alert("No data to export.");
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Role,Status\n"
            + candidates.map(c =>
                `${c.first_name} ${c.last_name},${c.email},${c.role || 'N/A'},${c.status}`
              ).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "luxe_candidates.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── ONBOARDING ───────────────────────────────────────────
    // WHY: Moved handleSendInvite here (was oddly placed before
    // state declarations in the original). Now it lives near the
    // logic it relates to and has access to all state.
    const handleSendInvite = async (email) => {
        try {
            const response = await axios.post(
                'http://localhost:8000/api/send-invite/',
                { email }
            );
            alert(response.data.message);
        } catch (error) {
            console.error("Error sending invite", error);
            alert("Failed to send invite. Please try again.");
        }
    };

    // ── MODAL OPENERS ────────────────────────────────────────
    // WHY: Original had TWO handleAddNew and TWO handleEdit.
    // The first versions were stubs without tab-aware logic.
    // Kept only the correct, tab-aware versions.

    const handleAddNew = () => {
        setEditingId(null);
        if (activeTab === 'inventory') {
            setFormData({ asset_name: '', category: '', serial_number: '', status: 'available', model: '' });
        } else if (activeTab === 'talent') {
            setFormData({ first_name: '', last_name: '', email: '', role: '' });
        } else {
            setFormData({ first_name: '', last_name: '', email: '', department: '', designation: '', salary: '' });
        }
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        if (activeTab === 'inventory') {
            // WHY: Assets only have asset_name and model — don't
            // spread unrelated fields which would confuse the form
            setFormData({ asset_name: item.asset_name, model: item.model });
        } else {
            setFormData({ ...item });
        }
        setShowModal(true);
    };

    // ── CRUD: SUBMIT (Add / Edit) ────────────────────────────
    // WHY: Original handleSubmit had handleMetricSubmit defined
    // INSIDE it (inside the try-block payload section). That
    // broke the entire file — JS saw mismatched braces and the
    // outer function never closed. Fixed by keeping each handler
    // completely separate.
    //
    // Also: the CRUD modal <form> was mistakenly using
    // onSubmit={handleMetricSubmit}. Changed to handleSubmit.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Pick the right endpoint based on which tab is open
            let url = API_BASE;
            if (activeTab === 'talent')    url = CANDIDATE_URL;
            if (activeTab === 'inventory') url = ASSET_URL;

            // Build the correct payload for each tab
            let payload;
            if (activeTab === 'inventory') {
                payload = {
                    asset_name: formData.asset_name,
                    model: formData.model,
                    status: formData.status || 'available'
                };
            } else if (activeTab === 'talent') {
                payload = {
                    first_name: formData.first_name,
                    last_name:  formData.last_name,
                    email:      formData.email,
                    role:       formData.role
                };
            } else {
                // workforce — ensure salary is a number
                payload = {
                    ...formData,
                    salary: parseFloat(formData.salary)
                };
            }

            if (editingId) {
                await axios.put(`${url}${editingId}/`, payload, { headers });
            } else {
                await axios.post(url, payload, { headers });
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("API Error:", err.response?.data);
            const details = err.response?.data
                ? JSON.stringify(err.response.data)
                : "Check connection";
            alert(`Operational Failure: ${details}`);
        }
    };

    // ── CRUD: DELETE ─────────────────────────────────────────
    // WHY: Original had THREE handleDelete declarations:
    //   1. Near the top — correct axios version
    //   2. Inside renderTalentATS — used fetch() instead of axios,
    //      and called window.location.reload() instead of fetchData()
    //   3. Inside handleLeaveAction's broken catch block
    // Kept only ONE correct version here.
    const handleDelete = async (id) => {
        const type = activeTab === 'inventory' ? "ASSET" : "PERSONNEL";
        if (window.confirm(`TERMINATION PROTOCOL: Remove this ${type}?`)) {
            try {
                const token = localStorage.getItem('access_token');
                let url = API_BASE;
                if (activeTab === 'talent')    url = CANDIDATE_URL;
                if (activeTab === 'inventory') url = ASSET_URL;

                await axios.delete(`${url}${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
            } catch (err) {
                console.error("Delete Error:", err);
                alert("Operational Failure: Could not remove record.");
            }
        }
    };

    // ── LEAVE ACTIONS ────────────────────────────────────────
    // WHY: Original had TWO handleLeaveAction declarations.
    // The first one had an unclosed catch block that swallowed
    // handleDelete and updateMyProfile into it, breaking parsing.
    // Kept only the clean, single version below.
    const handleLeaveAction = async (leaveId, newStatus) => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            await axios.patch(
                `${LEAVE_URL}${leaveId}/`,
                { status: newStatus.toLowerCase() },
                { headers }
            );
            fetchData();
        } catch (err) {
            alert("Authorization Denied.");
        }
    };

    // ── PROFILE UPDATE ───────────────────────────────────────
    const updateMyProfile = async (updatedData) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.patch(
                MY_PROFILE_URL,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMyProfile(response.data);
            fetchData();
            alert("PROFILE UPDATED SUCCESSFULLY");
        } catch (err) {
            alert("SYNCHRONIZATION ERROR");
        }
    };

    // ── PERFORMANCE METRIC SUBMIT ────────────────────────────
    // WHY: Original had TWO handleMetricSubmit declarations —
    // one broken (inside handleSubmit) and one real. The broken
    // one also had a duplicate profile-check block. Kept only the
    // single, clean version below.
    const handleMetricSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!myProfile?.id) {
            alert("System Error: Admin profile not loaded. Please refresh.");
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const payload = {
                employee:         metricFormData.employee || myProfile.id,
                technical_skills: Number(metricFormData.technical_skills),
                productivity:     Number(metricFormData.productivity),
                communication:    Number(metricFormData.communication || 3),
                reliability:      Number(metricFormData.reliability)
            };
            await axios.post(METRIC_URL, payload, { headers });
            setShowGoalModal(false);
            fetchData();
            alert("Performance Appraisal Synced!");
        } catch (err) {
            console.error("Sync Error:", err.response?.data);
            const errorMsg = err.response?.data
                ? JSON.stringify(err.response.data)
                : "Check connection";
            alert(`Sync Failed: ${errorMsg}`);
        }
    };

    // ────────────────────────────────────────────────────────
    //  RENDER
    // ────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-[#c5a059]/30">

            {/* ── SIDEBAR ──────────────────────────────────── */}
            <aside className="w-64 border-r border-white/5 bg-[#0f172a] p-6 hidden lg:flex flex-col">
                <div className="mb-12 flex items-center gap-3 text-white">
                    <ShieldCheck className="text-[#c5a059]" size={28} />
                    <h1 className="text-xl font-bold tracking-tight uppercase">
                        HRMS <span className="text-[#c5a059]">Luxe</span>
                    </h1>
                </div>
                <nav className="space-y-1 flex-1">
                    {[
                        { id: 'workforce',   icon: Users,      label: 'Workforce' },
                        { id: 'talent',      icon: UserPlus,   label: 'Talent / ATS' },
                        { id: 'onboarding',  icon: FileCheck,  label: 'Onboarding' },
                        { id: 'payroll',     icon: Briefcase,  label: 'Payroll' },
                        { id: 'leaves',      icon: Clock,      label: 'Leave Management' },
                        { id: 'inventory',   icon: Monitor,    label: 'Inventory' },
                        { id: 'performance', icon: TrendingUp, label: 'Performance' },
                        { id: 'profile',     icon: UserCircle, label: 'My Profile' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                                activeTab === item.id
                                    ? 'bg-[#c5a059]/10 text-[#c5a059]'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                </nav>
                <button
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-red-400/50 hover:text-red-400 transition-all uppercase tracking-[0.2em]"
                >
                    <LogOut size={16} /> Terminate Session
                </button>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────── */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-[1px] w-4 bg-[#c5a059]"></span>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a059]">
                                System Operations
                            </p>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight capitalize">
                            {activeTab.replace('-', ' ')}
                        </h2>
                    </div>
                    {activeTab !== 'profile' && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    placeholder="Search records..."
                                    className="bg-[#1e293b] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none w-full md:w-64"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* WHY: Added performance tab check — that tab uses its
                                own "Evaluate" button (showGoalModal), not the generic
                                add-new modal, so we show the right action per tab. */}
                            {activeTab === 'performance' ? (
                                <button
                                    onClick={() => setShowGoalModal(true)}
                                    className="bg-[#c5a059] text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-all"
                                >
                                    <Plus size={18} /> <span className="hidden sm:inline">Evaluate</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddNew}
                                    className="bg-[#c5a059] text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-all"
                                >
                                    <Plus size={18} /> <span className="hidden sm:inline">Action</span>
                                </button>
                            )}
                        </div>
                    )}
                </header>

                {/* ── TAB: TALENT / ATS ────────────────────── */}
                {/* WHY: Original had a duplicate static grid AND the
                    renderTalentATS() function that was never called.
                    Combined into one block using the real candidates state. */}
                {activeTab === 'talent' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 animate-in fade-in duration-500">
                        <div className="lg:col-span-2 bg-[#0f172a]/50 rounded-2xl border border-white/5 p-8 min-h-[450px]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">
                                    Active Job Openings
                                </h3>
                                <Filter size={16} className="text-slate-500" />
                            </div>

                            {candidates && candidates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {candidates.map(cand => (
                                        <div
                                            key={cand.id}
                                            className="bg-[#1e293b] p-5 rounded-xl border border-white/5 hover:border-[#c5a059]/30 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-white font-bold">
                                                        {cand.first_name} {cand.last_name}
                                                    </h4>
                                                    <p className="text-[10px] text-[#c5a059] uppercase tracking-widest mt-1">
                                                        {cand.role || "Developer"}
                                                    </p>
                                                </div>
                                                <span className="bg-[#c5a059]/10 text-[#c5a059] text-[8px] font-black px-2 py-1 rounded uppercase">
                                                    {cand.status || 'Applied'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                                <Send size={14} className="text-slate-500" />
                                                <button
                                                    onClick={() => handleDelete(cand.id)}
                                                    className="text-slate-600 hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <TrendingUp size={48} className="text-slate-800 mb-4" />
                                    <p className="text-slate-500 text-sm mb-2">
                                        Job Pipeline is currently empty
                                    </p>
                                    <button
                                        onClick={handleAddNew}
                                        className="text-[#c5a059] text-[10px] font-black uppercase tracking-widest hover:underline"
                                    >
                                        START NEW CAMPAIGN
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ATS Toolbox */}
                        <div className="bg-[#0f172a]/50 rounded-2xl border border-white/5 p-8 h-fit">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">
                                ATS Toolbox
                            </h3>
                            <div className="space-y-3">
                                <label className="w-full bg-white/5 hover:bg-white/10 text-slate-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-white/5 cursor-pointer transition-all">
                                    <Upload size={16} className="text-[#c5a059]" />
                                    Resume AI Parser
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleResumeUpload}
                                        accept=".pdf,.doc,.docx"
                                    />
                                </label>
                                <button
                                    onClick={exportCandidates}
                                    className="w-full bg-white/5 hover:bg-white/10 text-slate-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-white/5 transition-all"
                                >
                                    <Download size={16} className="text-[#c5a059]" /> Export Candidate Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: ONBOARDING ──────────────────────── */}
                {activeTab === 'onboarding' && (
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden animate-in fade-in duration-500">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">New Personnel</th>
                                    <th className="px-6 py-4">Current Phase</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {/* WHY: Render real onboarding data if available,
                                    otherwise show the sample row as fallback */}
                                {onboarding.length > 0 ? (
                                    onboarding.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-white uppercase tracking-tighter">
                                                    {item.employee_name || 'New Personnel'}
                                                </p>
                                                <p className="text-[10px] text-slate-600 font-bold">
                                                    {item.status || 'awaiting_verification'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-slate-400 italic font-medium">
                                                {item.phase || 'Digital Rights Signature'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#c5a059]"
                                                        style={{ width: `${item.progress || 45}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    className="text-[#c5a059] text-[10px] font-black uppercase hover:underline tracking-widest"
                                                    onClick={() => handleSendInvite(item.email || '')}
                                                >
                                                    Send Invite
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-white uppercase tracking-tighter">
                                                Sample Personnel
                                            </p>
                                            <p className="text-[10px] text-slate-600 font-bold">
                                                awaiting_verification.sh
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-400 italic font-medium">
                                            Digital Rights Signature
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#c5a059] w-[45%]"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                className="text-[#c5a059] text-[10px] font-black uppercase hover:underline tracking-widest"
                                                onClick={() => handleSendInvite('personnel@example.com')}
                                            >
                                                Send Invite
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── TAB: WORKFORCE ───────────────────────── */}
                {activeTab === 'workforce' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {employees
                            .filter(emp =>
                                emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((emp) => (
                                <div
                                    key={emp.id}
                                    className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 group hover:border-[#c5a059]/30 transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#c5a059]/10 transition-colors"></div>
                                    <div className="flex items-start justify-between relative z-10 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8e6d3a] flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[#c5a059]/20">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg tracking-tight">
                                                    {emp.first_name} {emp.last_name}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                                    {emp.designation || 'Specialist'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(emp)}
                                                className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-lg transition-all"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium text-xs uppercase tracking-tighter">
                                                Department
                                            </span>
                                            <span className="text-slate-200 font-bold px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider border border-white/5">
                                                {emp.department}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium text-xs uppercase tracking-tighter">
                                                Protocol Payout
                                            </span>
                                            <span className="text-[#c5a059] font-black tracking-tighter">
                                                ₹{Number(emp.salary).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* ── TAB: PAYROLL ─────────────────────────── */}
                {activeTab === 'payroll' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                                    Total Staff Payout
                                </p>
                                <p className="text-3xl font-black text-white tracking-tighter">
                                    ₹{stats.total_payout?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                                    Average Salary
                                </p>
                                <p className="text-3xl font-black text-white tracking-tighter">
                                    ₹{stats.avg_salary?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                                    Total Staff
                                </p>
                                <p className="text-3xl font-black text-white tracking-tighter">
                                    {stats.total_staff}
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8">
                            <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">
                                Expenditure Analysis
                            </h3>
                            <div className="space-y-6">
                                {departmentData.map((dept) => (
                                    <div key={dept.name} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                            <span className="text-slate-400">{dept.name}</span>
                                            <span className="text-[#c5a059]">₹{dept.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#c5a059] transition-all duration-1000"
                                                style={{ width: `${(dept.value / maxSpending) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: LEAVE MANAGEMENT ────────────────── */}
                {activeTab === 'leaves' && (
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden animate-in fade-in duration-500">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 text-center">Protocol</th>
                                    <th className="px-6 py-4">Personnel</th>
                                    <th className="px-6 py-4">Timeframe</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Authorization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5 text-center">
                                            <AlertCircle className="text-[#c5a059] mx-auto" size={18} />
                                        </td>
                                        <td className="px-6 py-5 font-bold text-white">
                                            {leave.employee_name}
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                                            {leave.start_date} → {leave.end_date}
                                        </td>
                                        <td className="px-6 py-5 text-xs">
                                            <span className={`px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] ${
                                                leave.status === 'Approved'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleLeaveAction(leave.id, 'Approved')}
                                                    className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-all"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleLeaveAction(leave.id, 'Rejected')}
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── TAB: INVENTORY ───────────────────────── */}
                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-in fade-in duration-500">
                        {assets.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-[#0f172a]/50 rounded-2xl border border-white/5">
                                <Monitor size={48} className="mx-auto text-slate-700 mb-4" />
                                <p className="text-slate-500">The Vault is empty. Add your first asset.</p>
                            </div>
                        ) : (
                            assets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="bg-[#0f172a]/50 border border-white/10 p-6 rounded-2xl hover:border-[#c5a059]/30 transition-all group relative"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-[#c5a059]/10 rounded-lg text-[#c5a059]">
                                            <Monitor size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                                            {asset.status || 'Available'}
                                        </span>
                                    </div>
                                    <div className="mb-8">
                                        <h3 className="text-white font-bold text-xl tracking-tight mb-1">
                                            {asset.asset_name}
                                        </h3>
                                        <p className="text-slate-500 text-[11px] uppercase tracking-widest font-semibold">
                                            {asset.model}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleEdit(asset)}
                                            className="text-slate-500 hover:text-[#c5a059] transition-all p-2 rounded-lg hover:bg-white/5"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="text-slate-500 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-white/5"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── TAB: PERFORMANCE ─────────────────────── */}
                {activeTab === 'performance' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-2xl">
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                    Avg Team Rating
                                </p>
                                <h3 className="text-3xl font-bold text-blue-500 mt-2">
                                    {perfStats.avg_rating || "0.0"}
                                    <span className="text-xs text-gray-600"> / 5.0</span>
                                </h3>
                            </div>
                            <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-2xl">
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                    Productivity Avg
                                </p>
                                <h3 className="text-3xl font-bold text-amber-500 mt-2">
                                    {perfStats.avg_productivity || 0}%
                                </h3>
                            </div>
                            <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-2xl">
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                    Reviews Logged
                                </p>
                                <h3 className="text-3xl font-bold text-emerald-500 mt-2">
                                    {perfStats.total_reviews || 0}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-[#0f172a] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1e293b]/50">
                                <h2 className="font-bold text-white uppercase text-xs tracking-widest">
                                    Work Performance Analytics
                                </h2>
                                <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black italic">
                                    LIVE SYSTEM DATA
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/20 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                                        <tr>
                                            <th className="p-4">Employee</th>
                                            <th className="p-4 text-center">Technical Proficiency</th>
                                            <th className="p-4 text-center">Reliability Score</th>
                                            <th className="p-4">Overall Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {metrics.map(m => (
                                            <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4">
                                                    <p className="font-bold text-blue-400">{m.employee_name}</p>
                                                    <p className="text-[9px] text-slate-600 font-bold uppercase">
                                                        Work ID: #{m.id}
                                                    </p>
                                                </td>
                                                <td className="p-4 text-center text-sm font-black text-slate-300">
                                                    {m.technical_skills}
                                                    <span className="text-gray-600"> / 5</span>
                                                </td>
                                                <td className="p-4 text-center text-sm font-black text-slate-300">
                                                    {m.reliability}
                                                    <span className="text-gray-600"> / 5</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden max-w-[150px]">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-700"
                                                                style={{ width: `${(m.overall_score / 5) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-black text-white text-xs">
                                                            {m.overall_score}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: PROFILE ─────────────────────────── */}
                {/* WHY: Original showed hardcoded "AD" initials and
                    "System Administrator" regardless of who is logged in.
                    Now uses real myProfile data with safe fallbacks. */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto bg-[#0f172a] border border-white/5 rounded-3xl p-10 text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#c5a059] to-[#8e6d3a] rounded-3xl mx-auto mb-6 flex items-center justify-center text-black font-black text-3xl shadow-2xl shadow-[#c5a059]/20">
                            {myProfile?.first_name?.[0] || 'A'}{myProfile?.last_name?.[0] || 'D'}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {myProfile
                                ? `${myProfile.first_name} ${myProfile.last_name}`
                                : 'System Administrator'}
                        </h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-8">
                            {myProfile?.designation || 'Root Access Authorized'}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="bg-white/5 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    Department
                                </p>
                                <p className="text-sm font-bold text-white">
                                    {myProfile?.department || 'Administration'}
                                </p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    Email
                                </p>
                                <p className="text-sm font-bold text-white truncate">
                                    {myProfile?.email || '—'}
                                </p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    Clearance Level
                                </p>
                                <p className="text-sm font-bold text-white">Tier 1 Elite</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    Last Sync
                                </p>
                                <p className="text-sm font-bold text-white">T-04:22:00</p>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* ── PERFORMANCE EVAL MODAL ───────────────────── */}
            {showGoalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111827] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
                        <div className="mb-8">
                            <h2 className="text-white text-2xl font-black tracking-tight">
                                Evaluate Performance
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                                Operational Metrics Sync
                            </p>
                        </div>
                        <form onSubmit={handleMetricSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Select Employee to Evaluate
                                </label>
                                <select
                                    className="w-full bg-black/20 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition cursor-pointer"
                                    value={metricFormData.employee}
                                    onChange={(e) => setMetricFormData({ ...metricFormData, employee: e.target.value })}
                                    required
                                >
                                    <option value="" className="bg-slate-900">Select Personnel...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id} className="bg-slate-900">
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {[
                                { key: 'technical_skills', label: 'Technical Proficiency', color: 'blue' },
                                { key: 'productivity',     label: 'Work Productivity',     color: 'amber' },
                                { key: 'reliability',      label: 'Reliability Score',     color: 'emerald' },
                            ].map(({ key, label, color }) => (
                                <div key={key} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            {label}
                                        </label>
                                        <span className={`text-${color}-500 font-black text-sm bg-${color}-500/10 px-2 py-0.5 rounded`}>
                                            {metricFormData[key]} / 5
                                        </span>
                                    </div>
                                    <input
                                        type="range" min="1" max="5" step="1"
                                        className={`w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-${color}-500`}
                                        value={metricFormData[key]}
                                        onChange={(e) => setMetricFormData({
                                            ...metricFormData,
                                            [key]: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            ))}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowGoalModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition"
                                >
                                    Sync Metrics
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── CRUD MODAL (Add / Edit) ───────────────────── */}
            {/* WHY: Original had onSubmit={handleMetricSubmit} on this
                form — that called the performance API instead of the
                employee/asset API. Fixed to onSubmit={handleSubmit}. */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                {editingId
                                    ? 'Modify Record'
                                    : (activeTab === 'inventory' ? 'New Asset' : 'New Personnel')}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'inventory' ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Device Name (e.g. MacBook Pro)"
                                        className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-all"
                                        value={formData.asset_name || ''}
                                        onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Model / Serial Number"
                                        className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-all"
                                        value={formData.model || ''}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                            value={formData.first_name || ''}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                            value={formData.last_name || ''}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Corporate Email"
                                        className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            placeholder={activeTab === 'talent' ? "Target Role" : "Department"}
                                            className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                            value={activeTab === 'talent' ? (formData.role || '') : (formData.department || '')}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                [activeTab === 'talent' ? 'role' : 'department']: e.target.value
                                            })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Designation"
                                            className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                            value={formData.designation || ''}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            required={activeTab === 'workforce'}
                                        />
                                    </div>
                                    {/* Hide salary field for talent/ATS candidates */}
                                    {activeTab !== 'talent' && (
                                        <input
                                            type="number"
                                            placeholder="Salary Protocol"
                                            className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                            value={formData.salary || ''}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                            required
                                        />
                                    )}
                                </>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-[#c5a059] text-black font-black py-4 rounded-xl mt-4 uppercase tracking-widest text-xs hover:bg-[#b08d4a] transition-all"
                            >
                                Execute Submission
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;