import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Users, MapPin, CheckCircle, Clock, User, Type,
  AlignLeft, Pencil, Trash2, Plus, RefreshCw, Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://127.0.0.1:8083';

const emptyForm = {
  eventType: '',
  guestCount: '',
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  speaker: ''
};

const toFormData = (event) => {
  const scheduled = event.scheduledDate ? new Date(event.scheduledDate) : null;
  return {
    eventType: event.eventType || '',
    guestCount: event.guestCount || '',
    title: event.title || '',
    description: event.description || '',
    date: scheduled && !Number.isNaN(scheduled) ? scheduled.toISOString().slice(0, 10) : '',
    time: scheduled && !Number.isNaN(scheduled) ? scheduled.toTimeString().slice(0, 5) : '',
    venue: event.venue || '',
    speaker: event.speaker || ''
  };
};

const toPayload = (formData) => ({
  title: formData.title,
  description: formData.description,
  eventType: formData.eventType,
  guestCount: formData.guestCount ? Number(formData.guestCount) : null,
  venue: formData.venue,
  speaker: formData.speaker,
  scheduledDate: `${formData.date}T${formData.time || '00:00'}:00`,
  hashtags: formData.eventType ? [formData.eventType.toLowerCase().replace(/\s+/g, '-')] : []
});

const Booking = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [registeredIds, setRegisteredIds] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const token = localStorage.getItem('token');
  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

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

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/events/');
      setEvents(Array.isArray(data) ? data : []);
      if (user?.role === 'ROLE_USER') {
        const registrations = await request('/events/registrations/me');
        setRegisteredIds((Array.isArray(registrations) ? registrations : [])
          .map((registration) => registration.event?.id)
          .filter(Boolean));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => canManage || !event.completed)
      .filter((event) => (event.eventType || event.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate));
  }, [events, searchTerm, canManage]);

  const handleAddEvent = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError('');
    setStep(1);
    setShowForm(true);
    setIsEditMode(false);
  };

  const handleEdit = (event) => {
    setFormData(toFormData(event));
    setEditingId(event.id);
    setError('');
    setStep(1);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await request(`/events/${id}`, { method: 'DELETE' });
    await loadEvents();
  };

  const handleMarkCompleted = async (id) => {
    await request(`/events/${id}/complete`, { method: 'PUT' });
    await loadEvents();
  };

  const handleRegistration = async (id, unregister = false) => {
    await request(unregister ? `/events/${id}/unregister` : `/events/register/${id}`, { method: 'POST' });
    setRegisteredIds((ids) => unregister ? ids.filter((value) => value !== id) : [...new Set([...ids, id])]);
    await loadEvents();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = toPayload(formData);
    setError('');
    try {
      await request(editingId ? `/events/${editingId}` : '/events/', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setShowForm(false);
      setEditingId(null);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!showForm) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-emerald-500" size={32} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-serif font-light text-white">Your Orchestrated Events</h1>
                <p className="text-stone-400 text-sm">Review and manage your luxury itineraries.</p>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-4">
                <Button onClick={handleAddEvent} className="bg-[#D4AF37] text-black active:bg-[#800020] border-none px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-2">
                  <Plus size={16} /> Add Event
                </Button>
                <Button onClick={() => setIsEditMode(!isEditMode)} className={`${isEditMode ? 'bg-royalPurple text-white' : 'bg-white/10 text-white'} border border-white/10 px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-2`}>
                  <RefreshCw size={16} className={isEditMode ? 'animate-spin' : ''} /> {isEditMode ? 'Done' : 'Update'}
                </Button>
              </div>
            )}
          </div>

          <div className="relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
            <input
              type="text"
              placeholder="Search by event type or title..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && <p className="text-stone-400 text-center py-12">Loading events...</p>}
          {error && <p className="text-red-400 text-center py-12">{error}</p>}

          <div className="grid grid-cols-1 gap-6 mb-12">
            {filteredEvents.map((event) => {
              const isRegistered = registeredIds.includes(event.id);
              const scheduled = event.scheduledDate ? new Date(event.scheduledDate) : null;
              return (
                <Card key={event.id} className="bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-md hover:bg-white/[0.07] transition-all group rounded-3xl relative">
                  {canManage && (
                    <div className="absolute top-6 right-6 flex gap-2 z-20">
                      {!event.completed && (
                        <button onClick={() => handleMarkCompleted(event.id)} className="px-3 py-2 bg-emerald-500/10 text-emerald-300 rounded-lg hover:bg-emerald-500/20 transition-colors">Mark Done</button>
                      )}
                      {isEditMode && (
                        <>
                          <button onClick={() => handleEdit(event)} className="p-2 bg-softGold/20 text-softGold rounded-lg hover:bg-softGold/30 transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="border-b border-white/10 pb-4 text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-softGold/10 text-softGold text-[10px] uppercase tracking-[0.2em] rounded-full border border-softGold/20 font-bold">
                            {event.eventType || 'Custom Event'}
                          </span>
                          {event.completed && <span className="px-2 py-1 bg-green-900 text-emerald-300 text-xs rounded-full">Completed</span>}
                        </div>
                        <h2 className="text-2xl text-white font-serif font-light group-hover:text-softGold transition-colors">{event.title}</h2>
                        <p className="text-stone-400 mt-2 text-sm italic line-clamp-2">"{event.description}"</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-[11px] uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-2 text-stone-300"><Users size={14} className="text-softGold" /> {event.guestCount || 0} Guests</div>
                        <div className="flex items-center gap-2 text-stone-300"><Calendar size={14} className="text-softGold" /> {scheduled ? scheduled.toLocaleDateString() : '-'}</div>
                        <div className="flex items-center gap-2 text-stone-300"><Clock size={14} className="text-softGold" /> {scheduled ? scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                        <div className="flex items-center gap-2 text-stone-300"><MapPin size={14} className="text-softGold" /> {event.venue || '-'}</div>
                        <div className="flex items-center gap-2 text-stone-300"><User size={14} className="text-softGold" /> {event.speaker || '-'}</div>
                      </div>
                    </div>
                    {user?.role === 'ROLE_USER' && (
                      <div className="flex items-end">
                        <Button
                          onClick={() => handleRegistration(event.id, isRegistered)}
                          className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold ${isRegistered ? 'bg-royalPurple text-white' : 'bg-[#D4AF37] text-black active:bg-[#800020]'}`}
                        >
                          {isRegistered ? 'Unregister' : 'Register'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 bg-[#11100F] text-[#FAF9F6]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-light mb-2 text-white">{editingId ? 'Edit Event' : 'Plan Your Next Event'}</h1>
          <p className="text-stone-400">Enter your event details to begin the professional scheduling process.</p>
        </div>
        {error && <div className="max-w-3xl mx-auto mb-8 bg-red-500/10 text-red-300 border border-red-500/20 rounded-xl p-4 text-sm">{error}</div>}

        <div className="flex justify-between mb-12 relative px-10">
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-white/10 -translate-y-1/2 -z-0"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${step >= s ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-[#11100F] text-stone-500 border-2 border-white/10'}`}>
              {s}
            </div>
          ))}
        </div>

        <Card className="p-8 md:p-12 shadow-2xl bg-white/5 border-white/10 backdrop-blur-xl">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-stone-300 mb-3">Type of Event</label>
                    <input required type="text" placeholder="e.g. Corporate Gala" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><Users size={16} /> Estimated Guests</label>
                    <input required type="number" placeholder="e.g. 150" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><Type size={16} /> Event Title</label>
                  <input required type="text" placeholder="e.g. Summer Solstice Soiree" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><AlignLeft size={16} /> Event Description</label>
                  <textarea required rows="4" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none resize-none focus:ring-2 focus:ring-[#D4AF37]/20" placeholder="Detail your event vision..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                </div>
                <div className="flex justify-end mt-8">
                  <Button onClick={() => setStep(2)} className="px-10 bg-[#D4AF37] text-black active:bg-[#800020] border-none transition-all">Next Step</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><Calendar size={16} /> Targeted Date</label>
                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><Clock size={16} /> Time</label>
                    <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><MapPin size={16} /> Venue</label>
                    <input required type="text" placeholder="e.g. Grand Ballroom" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-300 mb-3 flex items-center gap-2"><User size={16} /> Speaker</label>
                    <input required type="text" placeholder="Name of the guest speaker" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20" value={formData.speaker} onChange={(e) => setFormData({ ...formData, speaker: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-stone-400">Back</Button>
                  <Button onClick={() => setStep(3)} className="px-10 bg-[#D4AF37] text-black active:bg-[#800020] border-none transition-all">Next Step</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-serif mb-6 text-softGold">Review Orchestration</h3>
                  <div className="space-y-4 text-stone-300">
                    <p><strong className="text-white uppercase tracking-widest text-xs">Title:</strong> {formData.title}</p>
                    <p><strong className="text-white uppercase tracking-widest text-xs">Itinerary:</strong> {formData.date} at {formData.time}</p>
                    <p><strong className="text-white uppercase tracking-widest text-xs">Location:</strong> {formData.venue}</p>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-stone-400">Back</Button>
                  <Button type="submit" className="px-12 bg-[#D4AF37] text-black active:bg-[#800020] font-bold border-none transition-all">
                    {editingId ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
