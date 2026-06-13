import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Crown, User, LogOut, LayoutDashboard, BarChart, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const showEventsOption = user?.role !== 'ROLE_MANAGER';
  const showDashboardOption = user?.role === 'ROLE_ADMIN';
  const showAnalyticsOption = Boolean(user);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-[#11100F]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to={user ? "/home" : "/"} className="flex items-center gap-2">
            <div className="w-10 h-10 border border-[#D4AF37]/30 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-md">
              <Crown className="text-[#D4AF37]" size={24} />
            </div>
            <span className="text-2xl font-serif font-light text-[#FAF9F6] tracking-tighter uppercase">
              Royal <span className="text-[#D4AF37] font-normal">Purple</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to={user ? "/home" : "/"} className="text-stone-300 hover:text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] transition-colors">Home</Link>
            {showEventsOption && (
              <Link to="/booking" className="text-stone-300 hover:text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] transition-colors">Events</Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                {showDashboardOption && (
                  <Link to="/dashboard" className="flex items-center gap-2 text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}
                {showAnalyticsOption && (
                  <Link to="/analytics" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-stone-300 hover:text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] transition-colors">
                    <BarChart size={18} />
                    Analytics
                  </Link>
                )}
                {user.role === 'ROLE_MANAGER' && (
                  <Link to="/management" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-stone-300 hover:text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] transition-colors">
                    <Briefcase size={18} />
                    Management
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-stone-300 hover:text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] transition-colors">
                  <User size={18} />
                  Profile
                </Link>
                <div className="h-6 w-px bg-white/10"></div>
                <button onClick={handleLogout} className="text-stone-500 hover:text-red-400 transition-colors">
                  <LogOut size={20} />
                </button>
                <div className="w-9 h-9 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-stone-300 hover:text-[#D4AF37] font-sans text-[10px] uppercase tracking-[0.2em] transition-colors">Login</Link>
                <Button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-[#D4AF37] text-black active:bg-[#800020] text-[10px] tracking-[0.2em] font-bold rounded-full border-none transition-all">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-300">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#11100F] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-8 space-y-2">
              <Link to={user ? "/home" : "/"} onClick={() => setIsOpen(false)} className="block px-3 py-4 text-stone-300 hover:text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em]">Home</Link>
              {showEventsOption && (
                <Link to="/booking" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-stone-300 hover:text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em]">Events</Link>
              )}
              {user ? (
                <>
                  {showDashboardOption && (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em] font-bold border-t border-white/5">Dashboard</Link>
                  )}
                  {showAnalyticsOption && (
                    <Link to="/analytics" onClick={() => setIsOpen(false)} className={`block px-3 py-4 text-stone-300 hover:text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em] ${user.role === 'ROLE_USER' ? 'border-t border-white/5' : ''}`}>Analytics</Link>
                  )}
                  {user.role === 'ROLE_MANAGER' && (
                    <Link to="/management" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-stone-300 hover:text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em]">Management</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-stone-300 hover:text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em]">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-4 text-red-400 font-sans text-xs uppercase tracking-[0.2em] border-t border-white/5">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-stone-300 hover:text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em] border-t border-white/5">Login</Link>
                  <div className="px-3 pt-2">
                    <Button onClick={() => { navigate('/signup'); setIsOpen(false); }} className="w-full bg-[#D4AF37] text-black active:bg-[#800020] py-4 text-xs tracking-[0.2em] font-bold rounded-full border-none transition-all">Sign Up</Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
