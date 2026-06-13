import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, BarChart, CalendarDays, CheckCircle, Clock, Trophy, XCircle, Eye, X } from 'lucide-react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://127.0.0.1:8083';
const getRegistrationStatus = (registration) => registration.status || 'APPROVED';
const getEventStatus = (event) => event.approvalStatus || 'APPROVED';

const Analytics = () => {
    const { user } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [adminReports, setAdminReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (user) {
                setLoading(true);
                setError('');
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}` };

                    if (user.role === 'ROLE_MANAGER') {
                        const eventsResponse = await fetch(`${API_BASE}/events/`, { headers });
                        if (!eventsResponse.ok) throw new Error('Failed to fetch admin event report');

                        const eventsPayload = await eventsResponse.json();
                        const events = Array.isArray(eventsPayload) ? eventsPayload : [];
                        const registrationEntries = await Promise.all(
                            events.map(async (event) => {
                                try {
                                    const response = await fetch(`${API_BASE}/events/${event.id}/registrations`, { headers });
                                    if (!response.ok) return [event.id, []];
                                    const registrations = await response.json();
                                    return [event.id, Array.isArray(registrations) ? registrations : []];
                                } catch {
                                    return [event.id, []];
                                }
                            })
                        );
                        const registrationsByEvent = Object.fromEntries(registrationEntries);
                        const grouped = new Map();

                        events.forEach((event) => {
                            const registrations = registrationsByEvent[event.id] || [];
                            const approvedRegistrations = registrations.filter((registration) => getRegistrationStatus(registration) === 'APPROVED').length;
                            const totalSeats = Number(event.guestCount || 0) + approvedRegistrations;
                            const fillRate = totalSeats > 0 ? approvedRegistrations / totalSeats : 0;
                            const isRejected = getEventStatus(event) === 'REJECTED';
                            const isPending = getEventStatus(event) === 'PENDING';
                            const isSuccess = !isPending && !isRejected && fillRate > 0.5;
                            const isFailed = isRejected || (!isPending && fillRate <= 0.5);
                            const adminKey = event.createdBy?.id || event.creator || 'unknown-admin';
                            const adminName = event.createdBy?.name || event.creator || event.createdBy?.email || 'Unknown Admin';

                            if (!grouped.has(adminKey)) {
                                grouped.set(adminKey, {
                                    adminName,
                                    adminEmail: event.createdBy?.email || event.creator || '',
                                    totalEvents: 0,
                                    successEvents: 0,
                                    failedEvents: 0,
                                    pendingEvents: 0,
                                    totalSeats: 0,
                                    registeredSeats: 0,
                                    events: []
                                });
                            }

                            const report = grouped.get(adminKey);
                            report.totalEvents += 1;
                            report.successEvents += isSuccess ? 1 : 0;
                            report.failedEvents += isFailed ? 1 : 0;
                            report.pendingEvents += isPending ? 1 : 0;
                            report.totalSeats += totalSeats;
                            report.registeredSeats += approvedRegistrations;
                            report.events.push({
                                title: event.title || 'Untitled Event',
                                status: isPending ? 'Pending' : isSuccess ? 'Success' : 'Failed',
                                fillRate,
                                registeredSeats: approvedRegistrations,
                                totalSeats
                            });
                        });

                        const reports = Array.from(grouped.values())
                            .map((report) => {
                                const decidedEvents = report.successEvents + report.failedEvents;
                                const successRate = decidedEvents > 0 ? report.successEvents / decidedEvents : 0;
                                const fillRate = report.totalSeats > 0 ? report.registeredSeats / report.totalSeats : 0;
                                const performance = successRate >= 0.75
                                    ? 'Excellent'
                                    : successRate >= 0.5
                                        ? 'Good'
                                        : decidedEvents === 0
                                            ? 'Pending'
                                            : 'Needs Improvement';

                                return {
                                    ...report,
                                    successRate,
                                    fillRate,
                                    performance
                                };
                            })
                            .sort((a, b) => b.successRate - a.successRate || b.totalEvents - a.totalEvents);

                        setAdminReports(reports);
                        setSummary(null);
                        setChartData([]);
                        return;
                    }

                    const response = await fetch(`${API_BASE}/users/analytics`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) throw new Error('Failed to fetch analytics');
                    
                    const analytics = await response.json();
                    setSummary(analytics);

                    const chartKey = user.role === 'ROLE_USER'
                        ? 'registrationTrend'
                        : user.role === 'ROLE_ADMIN'
                            ? 'createdEventTrend'
                            : 'systemEventTrend';

                    const series = analytics[chartKey] || [];
                    const data = series.map((point) => ({
                        month: point.date,
                        Events: point.count,
                    }));
                    setChartData(data);
                } catch (error) {
                    console.error("Error loading analytics:", error);
                    setError(error.message || 'Failed to load analytics');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAnalytics();
    }, [user]);

    const managerTotals = useMemo(() => {
        return adminReports.reduce((totals, report) => ({
            admins: totals.admins + 1,
            totalEvents: totals.totalEvents + report.totalEvents,
            successEvents: totals.successEvents + report.successEvents,
            failedEvents: totals.failedEvents + report.failedEvents,
            pendingEvents: totals.pendingEvents + report.pendingEvents
        }), {
            admins: 0,
            totalEvents: 0,
            successEvents: 0,
            failedEvents: 0,
            pendingEvents: 0
        });
    }, [adminReports]);

    if (!user) {
        return (
            <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6] flex items-center justify-center">
                <p className="text-xl">Please log in to view analytics.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6] flex items-center justify-center">
                <p className="text-xl animate-pulse">Loading your analytics...</p>
            </div>
        );
    }

    if (user.role === 'ROLE_MANAGER') {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 bg-[#11100F] text-[#FAF9F6]">
                <div className="max-w-[96rem] mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 text-[#D4AF37] text-xs uppercase tracking-[0.22em] font-bold mb-3">
                            <Trophy size={18} />
                            Manager Analytics
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-light text-white">Admin Performance Report</h1>
                        <p className="text-stone-400 mt-3">Report generated from every admin's created events, success count, failures, and final performance.</p>
                    </motion.div>

                    {error && (
                        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                        {[
                            { label: 'Admins', value: managerTotals.admins, icon: Trophy, tone: 'text-[#D4AF37]' },
                            { label: 'Events Created', value: managerTotals.totalEvents, icon: BarChart, tone: 'text-sky-300' },
                            { label: 'Successful', value: managerTotals.successEvents, icon: CheckCircle, tone: 'text-emerald-300' },
                            { label: 'Failed', value: managerTotals.failedEvents, icon: XCircle, tone: 'text-red-300' }
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={stat.label} className="bg-white/5 border-white/10 p-5 h-36 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-bold">{stat.label}</span>
                                        <Icon size={20} className={stat.tone} />
                                    </div>
                                    <div className="text-4xl font-bold text-white">{stat.value}</div>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="bg-white/5 border-white/10 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-serif font-light text-white">Admin Report</h2>
                                <p className="text-sm text-stone-500">Success means more than 50% of seats were filled on an approved event.</p>
                            </div>
                            <BarChart className="text-[#D4AF37]" size={24} />
                        </div>

                        {adminReports.length === 0 ? (
                            <div className="py-16 text-center text-stone-500">No admin events available for reporting.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                                            <th className="py-3 pr-4 font-bold">Admin</th>
                                            <th className="py-3 pr-4 font-bold">Events Created</th>
                                            <th className="py-3 pr-4 font-bold">Success</th>
                                            <th className="py-3 pr-4 font-bold">Failed</th>
                                            <th className="py-3 font-bold">Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminReports.map((report) => (
                                            <tr key={`${report.adminName}-${report.adminEmail}`} className="border-b border-white/5 text-sm text-stone-300">
                                                <td className="py-4 pr-4">
                                                    <div className="font-semibold text-white">{report.adminName}</div>
                                                    <div className="text-xs text-stone-500">{report.adminEmail || '-'}</div>
                                                </td>
                                                <td className="py-4 pr-4 font-bold text-white">{report.totalEvents}</td>
                                                <td className="py-4 pr-4 text-emerald-300">{report.successEvents}</td>
                                                <td className="py-4 pr-4 text-red-300">{report.failedEvents}</td>
                                                <td className="py-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${
                                                            report.performance === 'Excellent'
                                                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                                                : report.performance === 'Good'
                                                                    ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                                                                    : report.performance === 'Pending'
                                                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                                                        : 'bg-red-500/10 text-red-300 border-red-500/20'
                                                        }`}>
                                                            {report.performance}
                                                        </span>
                                                        <button 
                                                            onClick={() => setSelectedAdmin(report)}
                                                            className="p-2 text-stone-500 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-all"
                                                            title="View Detailed Report"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <AnimatePresence>
                        {selectedAdmin && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full max-w-4xl max-h-[85vh] overflow-hidden"
                                >
                                    <Card className="bg-[#1A1918] border-white/10 flex flex-col h-full shadow-2xl">
                                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                            <div>
                                                <h2 className="text-2xl font-serif text-white">Admin Performance Detail</h2>
                                                <p className="text-stone-400 text-sm mt-1">{selectedAdmin.adminName} ({selectedAdmin.adminEmail})</p>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedAdmin(null)}
                                                className="p-2 text-stone-500 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <div className="p-6 overflow-y-auto space-y-8">
                                            <section>
                                                <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-4">Event History</h3>
                                                <div className="grid gap-3">
                                                    {selectedAdmin.events.map((event, idx) => (
                                                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                                            <div>
                                                                <div className="text-white font-medium">{event.title}</div>
                                                                <div className="text-xs text-stone-500 mt-1">
                                                                    Seats: {event.registeredSeats} / {event.totalSeats}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-right">
                                                                    <div className="text-xs text-stone-500 uppercase tracking-tighter">Fill Rate</div>
                                                                    <div className="text-white font-bold">{Math.round(event.fillRate * 100)}%</div>
                                                                </div>
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                                    event.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 
                                                                    event.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                                                                }`}>
                                                                    {event.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                                <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-3">Performance Conclusion</h3>
                                                <p className="text-stone-300 leading-relaxed italic">
                                                    {selectedAdmin.performance === 'Excellent' && (
                                                        "This administrator is performing exceptionally well. With a high success rate and efficient seat utilization, their events consistently meet attendance targets and maintain high quality standards."
                                                    )}
                                                    {selectedAdmin.performance === 'Good' && (
                                                        "This administrator maintains a steady and reliable performance. Most events achieve healthy attendance numbers and pass approval criteria regularly."
                                                    )}
                                                    {selectedAdmin.performance === 'Needs Improvement' && (
                                                        "Current metrics suggest a need for strategic adjustments. A significant number of events are seeing low fill rates or failing to meet success criteria, indicating a need for better promotion or planning."
                                                    )}
                                                    {selectedAdmin.performance === 'Pending' && (
                                                        "There is currently insufficient data to form a final performance conclusion as the administrator's events are primarily in a pending or early state."
                                                    )}
                                                </p>
                                                <div className="mt-4 flex gap-8 border-t border-white/5 pt-4">
                                                    <div>
                                                        <div className="text-[10px] text-stone-500 uppercase tracking-widest">Success Rate</div>
                                                        <div className="text-xl font-bold text-white">{Math.round(selectedAdmin.successRate * 100)}%</div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6]">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-serif font-light mb-4">Your Event Analytics</h1>
                    <p className="text-stone-400 text-lg">Insights into your registered events and participation over time.</p>
                </motion.div>

                <Card className="p-8 md:p-12 shadow-2xl bg-white/5 border-white/10 backdrop-blur-xl">
                    <h2 className="text-2xl font-serif font-light text-white mb-6 flex items-center gap-3">
                        <BarChart size={24} className="text-softGold" /> Event Activity Over Time
                    </h2>
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-stone-500 text-xs uppercase tracking-widest">Role</p>
                                <p className="text-softGold font-bold mt-1">{summary.role}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-stone-500 text-xs uppercase tracking-widest">Primary Events</p>
                                <p className="text-white font-bold mt-1">{user.role === 'ROLE_USER' ? summary.totalAttended : user.role === 'ROLE_ADMIN' ? summary.totalCreated : summary.totalSystemEvents ?? 0}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <p className="text-stone-500 text-xs uppercase tracking-widest">
                                    {user.role === 'ROLE_MANAGER' ? 'Total Users' : user.role === 'ROLE_ADMIN' ? 'Created Events' : 'Registrations'}
                                </p>
                                <p className="text-white font-bold mt-1">
                                    {user.role === 'ROLE_MANAGER'
                                        ? summary.totalSystemUsers ?? 0
                                        : user.role === 'ROLE_ADMIN'
                                            ? summary.totalCreated ?? 0
                                            : summary.totalAttended ?? 0}
                                </p>
                            </div>
                        </div>
                    )}
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5, }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="month" stroke="#999" />
                                <YAxis stroke="#999" />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#FAF9F6' }} labelStyle={{ color: '#D4AF37' }} />
                                <Line type="monotone" dataKey="Events" stroke="#D4AF37" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl text-stone-500">
                            <CalendarDays size={32} className="mb-2 opacity-20" />
                            <p>No event data available to display analytics.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
