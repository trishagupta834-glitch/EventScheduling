import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Star, ShieldCheck, Globe, GlassWater,
    PartyPopper, Music, Calendar as CalendarIcon,
    CheckCircle2, Clock, ChevronLeft, ChevronRight,
    ListTodo
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock Data for the Dashboard
    const mockEvents = [
        { id: 1, name: "Royal Gala Dinner", date: new Date().toISOString().split('T')[0], time: "19:00", desc: "Exclusive black-tie dinner at the Grand Ballroom.", type: "event", status: "confirmed" },
        { id: 2, name: "Floral Vendor Meeting", date: new Date().toISOString().split('T')[0], time: "10:30", desc: "Reviewing arrangements for the Summer Soiree.", type: "task", status: "pending" },
        { id: 3, name: "Venue Walkthrough", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "14:00", desc: "Final site inspection for technical setup.", type: "event", status: "confirmed" },
        { id: 4, name: "Contract Signature", date: new Date().toISOString().split('T')[0], time: "16:00", desc: "Finalize catering contract.", type: "task", status: "completed" },
    ];

    // Calendar Logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const today = new Date().toISOString().split('T')[0];

    const calendarDays = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const startOffset = firstDayOfMonth(currentYear, currentMonth);

    for (let i = 0; i < startOffset; i++) calendarDays.push(null);
    for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

    const getEventsForDate = (day) => {
        if (!day) return [];
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return mockEvents.filter(e => e.date === dateStr);
    };

    const handleDateClick = (day) => {
        if (day) {
            setSelectedDate(new Date(currentYear, currentMonth, day));
        }
    };

    // Authenticated View
    if (user) {
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        const todaysSchedule = mockEvents.filter(e => e.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time));

        const stats = [
            { label: "Today's Events", value: mockEvents.filter(e => e.date === today && e.type === 'event').length, icon: <CalendarIcon size={20} className="text-royalPurple" /> },
            { label: "Pending Tasks", value: mockEvents.filter(e => e.status === 'pending').length, icon: <Clock size={20} className="text-amber-500" /> },
            { label: "Completed", value: mockEvents.filter(e => e.status === 'completed').length, icon: <CheckCircle2 size={20} className="text-emerald-500" /> },
        ];

        return (
            <div className="pt-28 pb-12 bg-[#11100F] min-h-screen text-[#FAF9F6] relative overflow-hidden">
                {/* Premium Background Graphics */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80"
                        alt="Luxury Backdrop"
                        className="w-full h-full object-cover opacity-5 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-richBlack via-richBlack/95 to-richBlack"></div>

                    {/* Animated ambient light blobs to create depth */}
                    <motion.div
                        animate={{
                            x: [0, 100, -100, 0],
                            y: [0, -50, 50, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-royalPurple/5 blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, -80, 80, 0],
                            y: [0, 60, -60, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-softGold/10 blur-[120px]"
                    />
                </div>

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* Header & Stats */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl font-serif font-light mb-4"
                            >
                                Hello, <span className="text-softGold">{user.name.split(' ')[0]}</span>
                            </motion.h1>
                            <p className="text-xl text-stone-400">Welcome to your curated orchestration portal.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-white/5 border-white/10 p-8 flex flex-col items-center text-center h-full backdrop-blur-xl rounded-lg">
                                        <div className="flex items-center gap-3 mb-4 justify-center">
                                            <div className="scale-110">{stat.icon}</div>
                                            <div className="text-[12px] uppercase tracking-[0.2em] text-stone-500 font-bold">{stat.label}</div>
                                        </div>
                                        <div className="text-5xl font-bold text-white">{stat.value}</div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left: Today's Schedule */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-3xl font-serif flex items-center gap-4">
                                    <ListTodo className="text-softGold" size={28} />
                                    Schedule: {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {todaysSchedule.length > 0 ? (
                                    todaysSchedule.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <Card className="bg-white/5 border-white/10 p-8 group hover:bg-white/10 transition-all border-l-4 border-l-softGold backdrop-blur-md rounded-lg">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-softGold font-bold text-xl flex items-center gap-2">
                                                        <Clock size={18} /> {item.time}
                                                    </span>
                                                    <span className={`text-[12px] uppercase tracking-wider px-3 py-1 rounded-full border ${item.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-2xl mb-2 text-white group-hover:text-softGold transition-colors">{item.name}</h3>
                                                <p className="text-lg text-stone-400 font-light line-clamp-2">{item.desc}</p>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl text-stone-500">
                                        <CalendarIcon size={32} className="mb-2 opacity-20" />
                                        <p>No orchestration tasks scheduled.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Calendar */}
                        <div className="lg:col-span-7">
                            <Card className="bg-white/5 border-white/10 p-10 backdrop-blur-[40px] shadow-2xl rounded-lg">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-4xl font-serif text-white">
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 mb-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <div key={d} className="text-center text-xs font-bold text-stone-500 uppercase tracking-widest py-2">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((day, idx) => {
                                        const events = getEventsForDate(day);
                                        const isSelected = day === selectedDate.getDate() && currentMonth === selectedDate.getMonth();
                                        const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth();

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleDateClick(day)}
                                                className={`group/date rounded-lg
                        relative h-32 border border-white/5 flex flex-col items-center justify-center cursor-pointer transition-all
                          ${!day ? 'bg-transparent cursor-default' : 'hover:bg-white/5'}
                          ${isSelected ? 'bg-royalPurple/30 border-royalPurple/50 ring-1 ring-royalPurple/50' : ''}
                        `}
                                            >
                                                {day && (
                                                    <>
                                                        <span className={`text-lg ${isToday ? 'text-softGold font-bold underline underline-offset-4' : 'text-stone-300'}`}>
                                                            {day}
                                                        </span>

                                                        {/* Colored Dots for Events */}
                                                        <div className="mt-3 flex gap-1.5">
                                                            {events.map((e, ei) => (
                                                                <div
                                                                    key={ei}
                                                                    className={`w-2 h-2 rounded-full ${e.type === 'event' ? 'bg-royalPurple shadow-[0_0_5px_rgba(111,66,193,0.8)]' : 'bg-softGold'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // Existing Landing Page for Guests
    const services = [
        {
            title: "Corporate Galas",
            description: "Logistics-driven management for black-tie affairs designed with logistical excellence.",
            icon: <GlassWater className="text-[#D4AF37]" size={32} />,
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
        },
        {
            title: "Strategic Retreats",
            description: "Seamless scheduling and destination management for high-impact executive gatherings.",
            icon: <ShieldCheck className="text-[#D4AF37]" size={32} />,
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
        },
        {
            title: "Signature Weddings",
            description: "Precision tools to manage every timeline and vendor for a flawless wedding celebration.",
            icon: <PartyPopper className="text-[#D4AF37]" size={32} />,
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"
        },
        {
            title: "Exclusive Events",
            description: "Expert coordination for private concerts and high-profile social engagements.",
            icon: <Music className="text-[#D4AF37]" size={32} />,
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"
        }
    ];

    return (
        <div className="pt-20 bg-[#11100F]">
            {/* Hero Section */}
            <section className="relative h-[100vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80"
                        className="w-full h-full object-cover brightness-[0.3] contrast-[0.8]"
                        alt="Elegant Event Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-richBlack/70 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }} className="max-w-3xl text-left">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-12 h-[1px] bg-[#D4AF37]"></span>
                            <span className="text-[#D4AF37] uppercase tracking-[0.3em] font-bold text-[10px]">Seamless Orchestration</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif font-light text-white mb-10 leading-tight">
                            Orchestrate Exceptional Events with <span className="text-[#D4AF37] italic">Refined Precision</span>
                        </h1>
                        <p className="text-2xl text-stone-400 mb-12 font-light leading-relaxed max-w-2xl">
                            Manage your events with an intuitive platform designed for professional coordination and flawless execution.
                        </p>
                        <div className="flex justify-start">
                            <Button onClick={() => navigate('/signup')} className="px-12 py-6 bg-[#D4AF37] text-black active:bg-[#800020] text-base tracking-widest font-bold rounded-full transition-all duration-300">
                                Get Started
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="bg-black/40 border-y border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-40 grayscale text-stone-300 hover:grayscale-0 transition-all">
                    <Globe size={40} />
                    <Star size={40} />
                    <div className="text-2xl font-serif font-bold tracking-widest uppercase">Forbes</div>
                    <div className="text-2xl font-serif italic">Vogue</div>
                    <div className="text-2xl font-bold">GQ</div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-32 bg-[#11100F]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif font-light text-[#FAF9F6] mb-4">Signature Planning Solutions</h2>
                        <p className="text-stone-500 max-w-2xl mx-auto text-lg font-light">
                            Every detail precisely coordinated, every timeline flawlessly executed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <Card key={index} className="overflow-hidden p-0 group bg-white/5 border-white/10 backdrop-blur-md rounded-lg">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="mb-4 text-[#D4AF37]">{service.icon}</div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{service.title}</h3>
                                    <p className="text-stone-400 mb-4 text-sm leading-relaxed font-light">{service.description}</p>
                                    <button className="text-[#D4AF37] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all text-xs tracking-widest uppercase">
                                        Explore Details <ArrowRight size={16} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 bg-white/5 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-white">
                        <polygon points="0,0 100,0 100,100" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-light text-[#FAF9F6] mb-8 leading-tight">Ready to transform your event planning?</h2>
                    <p className="text-stone-400 text-xl mb-12 font-light">
                        Streamline your coordination and bring your vision to life with our professional management tools.
                    </p>
                    <Button
                        onClick={() => navigate('/signup')}
                        className="mx-auto px-12 py-5 bg-[#D4AF37] text-black active:bg-[#800020] tracking-widest font-bold rounded-full border-none shadow-2xl transition-all"
                    >
                        Get Started
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Home;
