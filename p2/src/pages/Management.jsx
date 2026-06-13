import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, BarChart3, Check, CheckCircle, Clock, RefreshCw,
  Search, ShieldCheck, TrendingDown, TrendingUp, Users, X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://127.0.0.1:8083';

const statusTone = {
  APPROVED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  REJECTED: 'bg-red-500/10 text-red-300 border-red-500/20'
};

const getRegistrationStatus = (registration) => registration.status || 'APPROVED';
const getEventApprovalStatus = (event) => event.approvalStatus || 'APPROVED';

const Management = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrationsByEvent, setRegistrationsByEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || payload.message || 'Request failed');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  const loadManagementData = async () => {
    setLoading(true);
    setError('');

    try {
      const eventPayload = await request('/events/');
      const eventList = Array.isArray(eventPayload) ? eventPayload : [];
      setEvents(eventList);

      const registrationEntries = await Promise.all(
        eventList.map(async (event) => {
          try {
            const registrations = await request(`/events/${event.id}/registrations`);
            return [event.id, Array.isArray(registrations) ? registrations : []];
          } catch {
            return [event.id, []];
          }
        })
      );

      setRegistrationsByEvent(Object.fromEntries(registrationEntries));
    } catch (err) {
      setError(err.message || 'Failed to load management data');
      setEvents([]);
      setRegistrationsByEvent({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagementData();
  }, []);

  const eventRows = useMemo(() => {
    return events.map((event) => {
      const registrations = registrationsByEvent[event.id] || [];
      const approved = registrations.filter((registration) => getRegistrationStatus(registration) === 'APPROVED').length;
      const pending = registrations.filter((registration) => getRegistrationStatus(registration) === 'PENDING').length;
      const rejected = registrations.filter((registration) => getRegistrationStatus(registration) === 'REJECTED').length;
      const total = registrations.length;
      const remainingSeats = Number(event.guestCount || 0);
      const totalSeats = remainingSeats + approved;
      const fillRate = totalSeats > 0 ? approved / totalSeats : 0;

      return {
        ...event,
        registrations,
        approved,
        pending,
        rejected,
        approvalStatus: getEventApprovalStatus(event),
        totalSeats,
        registeredSeats: approved,
        fillRate,
        isGood: fillRate > 0.5,
        totalRegistrations: total,
        demandScore: approved + pending
      };
    });
  }, [events, registrationsByEvent]);

  const summary = useMemo(() => {
    const totalRegistrations = eventRows.reduce((sum, event) => sum + event.totalRegistrations, 0);
    const pendingEvents = eventRows.filter((event) => event.approvalStatus === 'PENDING').length;
    const pendingRegistrations = eventRows.reduce((sum, event) => sum + event.pending, 0);
    const approved = eventRows.reduce((sum, event) => sum + event.approved, 0);
    const approvedEvents = eventRows.filter((event) => event.approvalStatus === 'APPROVED');
    const averageFill = approvedEvents.length ? approvedEvents.reduce((sum, event) => sum + event.fillRate, 0) / approvedEvents.length : 0;
    const bestEvent = [...approvedEvents].sort((a, b) => b.fillRate - a.fillRate)[0];
    const weakestEvent = [...approvedEvents].sort((a, b) => a.fillRate - b.fillRate)[0];

    return {
      totalEvents: eventRows.length,
      totalRegistrations,
      pendingEvents,
      pendingRegistrations,
      approved,
      averageFill,
      bestEvent,
      weakestEvent
    };
  }, [eventRows]);

  const filteredEvents = useMemo(() => {
    const needle = searchTerm.toLowerCase();

    return eventRows
      .filter((event) => {
        const content = `${event.title || ''} ${event.eventType || ''} ${event.venue || ''} ${event.creator || ''}`.toLowerCase();
        return content.includes(needle);
      })
      .sort((a, b) => b.fillRate - a.fillRate);
  }, [eventRows, searchTerm]);

  const pendingEvents = useMemo(() => {
    return eventRows.filter((event) => event.approvalStatus === 'PENDING');
  }, [eventRows]);

  const pendingRegistrations = useMemo(() => {
    return eventRows.flatMap((event) => (
      event.approvalStatus === 'APPROVED' ? event.registrations
        .filter((registration) => getRegistrationStatus(registration) === 'PENDING')
        .map((registration) => ({ ...registration, event }))
        : []
    ));
  }, [eventRows]);

  const handleRegistrationDecision = async (registrationId, decision) => {
    setActionId(`registration-${registrationId}`);
    setError('');

    try {
      await request(`/events/registrations/${registrationId}/${decision}`, { method: 'PUT' });
      await loadManagementData();
    } catch (err) {
      setError(err.message || 'Failed to update registration');
    } finally {
      setActionId(null);
    }
  };

  const handleEventDecision = async (eventId, decision) => {
    setActionId(`event-${eventId}`);
    setError('');

    try {
      await request(`/events/${eventId}/${decision}`, { method: 'PUT' });
      await loadManagementData();
    } catch (err) {
      setError(err.message || 'Failed to update event approval');
    } finally {
      setActionId(null);
    }
  };

  if (user?.role !== 'ROLE_MANAGER') {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6] flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-8 text-stone-300">
          Management is available for manager accounts.
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-[#11100F] text-[#FAF9F6]">
      <div className="max-w-[96rem] mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[#D4AF37] text-xs uppercase tracking-[0.22em] font-bold mb-3">
              <ShieldCheck size={18} />
              Manager Control
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-white">Event Management</h1>
            <p className="text-stone-400 mt-3">All admin-created events, registration health, and approval decisions.</p>
          </div>
          <Button onClick={loadManagementData} className="bg-white/10 text-white border border-white/10 px-5 py-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { label: 'All Events', value: summary.totalEvents, icon: BarChart3, tone: 'text-[#D4AF37]' },
            { label: 'Pending Events', value: summary.pendingEvents, icon: Clock, tone: 'text-amber-300' },
            { label: 'Approved', value: summary.approved, icon: CheckCircle, tone: 'text-emerald-300' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="bg-white/5 border-white/10 p-5 h-36 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-bold">{stat.label}</span>
                    <Icon size={20} className={stat.tone} />
                  </div>
                  <div className="text-4xl font-bold text-white">{loading ? '-' : stat.value}</div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-emerald-300" size={22} />
              <h2 className="text-xl font-serif font-light text-white">Doing Good</h2>
            </div>
            <p className="text-2xl font-bold text-white">{summary.bestEvent?.title || '-'}</p>
            <p className="text-sm text-stone-500 mt-2">
              {summary.bestEvent ? `${Math.round(summary.bestEvent.fillRate * 100)}% filled, ${summary.bestEvent.registeredSeats}/${summary.bestEvent.totalSeats} seats` : 'No approved event data yet.'}
            </p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="text-red-300" size={22} />
              <h2 className="text-xl font-serif font-light text-white">Needs Attention</h2>
            </div>
            <p className="text-2xl font-bold text-white">{summary.weakestEvent?.title || '-'}</p>
            <p className="text-sm text-stone-500 mt-2">
              {summary.weakestEvent ? `${Math.round(summary.weakestEvent.fillRate * 100)}% filled, ${summary.weakestEvent.registeredSeats}/${summary.weakestEvent.totalSeats} seats` : 'No approved event data yet.'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-6">
          <Card className="bg-white/5 border-white/10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-light text-white">Event Performance</h2>
                <p className="text-sm text-stone-500">Good means more than 50% of seats are filled.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search events..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-stone-400">Loading management data...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-stone-500">No events found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                      <th className="py-3 pr-4 font-bold">Event</th>
                      <th className="py-3 pr-4 font-bold">Admin</th>
                      <th className="py-3 pr-4 font-bold">Total Seats</th>
                      <th className="py-3 pr-4 font-bold">Registered</th>
                      <th className="py-3 pr-4 font-bold">Fill</th>
                      <th className="py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => {
                      return (
                        <tr key={event.id} className="border-b border-white/5 text-sm text-stone-300">
                          <td className="py-4 pr-4">
                            <div className="font-semibold text-white">{event.title || 'Untitled Event'}</div>
                            <div className="text-xs text-stone-500">{event.eventType || 'Custom Event'} / {event.venue || '-'}</div>
                            <span className={`inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] mt-2 ${statusTone[event.approvalStatus] || statusTone.APPROVED}`}>
                              {event.approvalStatus}
                            </span>
                          </td>
                          <td className="py-4 pr-4">{event.creator || event.createdBy?.email || '-'}</td>
                          <td className="py-4 pr-4 font-bold text-white">{event.totalSeats}</td>
                          <td className="py-4 pr-4 text-emerald-300">{event.registeredSeats}</td>
                          <td className="py-4 pr-4">{Math.round(event.fillRate * 100)}%</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-bold ${event.isGood ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                              {event.isGood ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {event.isGood ? 'Good' : 'Bad'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="bg-white/5 border-white/10 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif font-light text-white">Approvals</h2>
                <p className="text-sm text-stone-500">Approve admin events first, then review registration requests.</p>
              </div>
              <Clock className="text-[#D4AF37]" size={24} />
            </div>

            {loading ? (
              <div className="py-12 text-center text-stone-400">Loading approvals...</div>
            ) : pendingEvents.length === 0 && pendingRegistrations.length === 0 ? (
              <div className="py-12 text-center text-stone-500">No pending approvals.</div>
            ) : (
              <div className="space-y-6">
                {pendingEvents.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">Event Approvals</h3>
                    <div className="space-y-4">
                      {pendingEvents.map((event) => (
                        <div key={event.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold text-white">{event.title || 'Untitled Event'}</div>
                              <div className="text-xs text-stone-500 mt-1">
                                {event.eventType || 'Custom Event'} by {event.creator || event.createdBy?.email || 'admin'}
                              </div>
                              <span className={`inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] mt-3 ${statusTone.PENDING}`}>
                                Pending Event
                              </span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleEventDecision(event.id, 'approve')}
                                disabled={actionId === `event-${event.id}`}
                                className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50"
                                title="Approve event"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleEventDecision(event.id, 'reject')}
                                disabled={actionId === `event-${event.id}`}
                                className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50"
                                title="Reject event"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingRegistrations.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">Registration Approvals</h3>
                    <div className="space-y-4">
                      {pendingRegistrations.map((registration) => (
                        <div key={registration.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold text-white">{registration.user?.name || registration.user?.email || 'Registered member'}</div>
                              <div className="text-xs text-stone-500 mt-1">{registration.event?.title || 'Untitled Event'}</div>
                              <span className={`inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] mt-3 ${statusTone.PENDING}`}>
                                Pending Registration
                              </span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleRegistrationDecision(registration.id, 'approve')}
                                disabled={actionId === `registration-${registration.id}`}
                                className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50"
                                title="Approve registration"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleRegistrationDecision(registration.id, 'reject')}
                                disabled={actionId === `registration-${registration.id}`}
                                className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50"
                                title="Reject registration"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Management;
