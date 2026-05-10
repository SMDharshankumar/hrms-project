import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Onboarding = () => {
    const [personnel, setPersonnel] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Load data from your Django API
    const loadOnboarding = async () => {
        try {
            // Updated to match your search bar logic in views.py
            const res = await axios.get(`http://localhost:8000/api/onboarding/?search=${searchTerm}`);
            setPersonnel(res.data);
        } catch (err) {
            console.error("Error loading onboarding records:", err);
        }
    };

    useEffect(() => {
        loadOnboarding();
    }, [searchTerm]);

    // This handles the "SEND INVITE" button click
    const handleSendInvite = async (id) => {
        try {
            await axios.post(`http://localhost:8000/api/onboarding/${id}/send_invite/`);
            loadOnboarding(); // Refreshes the list to show updated status
        } catch (err) {
            alert("Failed to trigger invite process.");
        }
    };

    return (
        <div className="onboarding-page-container">
            {/* Top Bar with Search and + Action Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-amber-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-amber-400">
                    + Action
                </button>
            </div>

            {/* Main Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                        <th className="pb-4">New Personnel</th>
                        <th className="pb-4">Current Phase</th>
                        <th className="pb-4">Progress</th>
                        <th className="pb-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="text-white">
                    {personnel.map((person) => (
                        <tr key={person.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                            <td className="py-4">
                                <div className="font-bold">{person.employee_name} {person.employee_last}</div>
                                <div className="text-xs text-slate-500">awaiting verification</div>
                            </td>
                            <td className="py-4 text-sm text-slate-400">
                                {person.current_phase}
                            </td>
                            <td className="py-4">
                                {/* Progress Bar matching your UI */}
                                <div className="w-32 h-1.5 bg-slate-700 rounded-full">
                                    <div 
                                        className="h-full bg-amber-500 rounded-full" 
                                        style={{ width: `${person.progress}%` }}
                                    ></div>
                                </div>
                            </td>
                            <td className="py-4 text-right">
                                <button 
                                    onClick={() => handleSendInvite(person.id)}
                                    className="text-amber-500 text-xs font-bold uppercase tracking-wider hover:text-amber-300"
                                >
                                    {person.is_invite_sent ? "Resend Invite" : "Send Invite"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Onboarding;
