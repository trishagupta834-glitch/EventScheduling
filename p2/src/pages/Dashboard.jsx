import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';

const API_BASE = 'http://127.0.0.1:8083';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      setLoading(true);
      setError('');

      try {
        const eventsResponse = await fetch(`${API_BASE}/events/`, { headers });
        if (!eventsResponse.ok) throw new Error('Failed to load events');
        const eventsPayload = await eventsResponse.json();
        const eventList = Array.isArray(eventsPayload) ? eventsPayload : [];
        setEvents(eventList);

        if (canManage) {
          const countEntries = await Promise.all(
            eventList.map(async (event) => {
              try {
                const response = await fetch(`${API_BASE}/events/${event.id}/registrations`, { headers });
                if (!response.ok) return [event.id, 0];
                const registrations = await response.json();
                return [event.id, Array.isArray(registrations) ? registrations.length : 0];
              } catch {
                return [event.id, 0];
              }
            })
          );
          setRegistrationCounts(Object.fromEntries(countEntries));
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
        setEvents([]);
        setRegistrationCounts({});
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, canManage]);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const completedEvents = events.filter((event) => event.completed);
    const upcomingEvents = events.filter((event) => !event.completed && event.scheduledDate && new Date(event.scheduledDate) >= now);
    const totalRegistrations = events.reduce((sum, event) => sum + (registrationCounts[event.id] || 0), 0);
    const upcomingRegistrations = upcomingEvents.reduce((sum, event) => sum + (registrationCounts[event.id] || 0), 0);

    return {
      totalEvents: events.length,
      completedEvents: completedEvents.length,
      upcomingEvents,
      upcomingCount: upcomingEvents.length,
      totalRegistrations,
      upcomingRegistrations
    };
  }, [events, registrationCounts]);

  const statCards = [
    { label: 'Total Events', value: dashboardStats.totalEvents, icon: Calendar, tone: 'text-[#D4AF37]' },
    { label: 'Events Done', value: dashboardStats.completedEvents, icon: CheckCircle, tone: 'text-emerald-400' },
    { label: 'Upcoming Events', value: dashboardStats.upcomingCount, icon: Clock, tone: 'text-sky-300' },
    { label: 'Members Registered', value: dashboardStats.totalRegistrations, icon: Users, tone: 'text-violet-300' },
    { label: 'Upcoming Joins', value: dashboardStats.upcomingRegistrations, icon: Users, tone: 'text-amber-300' }
  ];

  return (
    <div className="pt-28 pb-12 bg-[#11100F] min-h-screen text-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-light text-white">Good Evening, {user?.name?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-stone-400">Live event and member registration overview.</p>
          </div>
        </div>

        {!canManage && (
          <Card className="bg-white/5 border-white/10 p-8 text-stone-300">
            Your dashboard is available after logging in with an admin or manager account.
          </Card>
        )}

        {canManage && (
          <div className="space-y-8">
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {statCards.map((stat, index) => {
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

            <Card className="bg-white/5 border-white/10 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-light text-white">Upcoming Event Registrations</h2>
                  <p className="text-sm text-stone-500">Members already joined for each upcoming event.</p>
                </div>
                <Clock className="text-[#D4AF37]" size={24} />
              </div>

              {loading ? (
                <div className="py-12 text-center text-stone-400">Loading dashboard...</div>
              ) : dashboardStats.upcomingEvents.length === 0 ? (
                <div className="py-12 text-center text-stone-500">No upcoming events found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                        <th className="py-3 pr-4 font-bold">Event</th>
                        <th className="py-3 pr-4 font-bold">Date</th>
                        <th className="py-3 pr-4 font-bold">Venue</th>
                        <th className="py-3 pr-4 font-bold">Seats Left</th>
                        <th className="py-3 font-bold">Registered Members</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardStats.upcomingEvents.map((event) => {
                        const scheduled = event.scheduledDate ? new Date(event.scheduledDate) : null;
                        return (
                          <tr key={event.id} className="border-b border-white/5 text-sm text-stone-300">
                            <td className="py-4 pr-4">
                              <div className="font-semibold text-white">{event.title}</div>
                              <div className="text-xs text-stone-500">{event.eventType || 'Custom Event'}</div>
                            </td>
                            <td className="py-4 pr-4">{scheduled ? scheduled.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</td>
                            <td className="py-4 pr-4">{event.venue || '-'}</td>
                            <td className="py-4 pr-4">{event.guestCount ?? '-'}</td>
                            <td className="py-4">
                              <span className="inline-flex min-w-12 justify-center rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 font-bold text-[#D4AF37]">
                                {registrationCounts[event.id] || 0}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
