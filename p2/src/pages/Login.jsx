import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext is correctly implemented
import { motion } from 'framer-motion';
import { Mail, Lock, Crown, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
  const location = useLocation();
  const signupSuccess = location.state?.signupSuccess;
  const registeredEmail = location.state?.registeredEmail;

  const [email, setEmail] = useState(registeredEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[#11100F] relative overflow-hidden">
      {/* Premium Background Graphics */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80"
          alt="Luxury Backdrop"
          className="w-full h-full object-cover opacity-10 scale-110 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F0F0F] via-[#0F0F0F]/90 to-[#2A2318]/40"></div>

        {/* Animated ambient light blobs to match Intro page */}
        <motion.div
          animate={{
            x: [0, 80, -80, 0],
            y: [0, -40, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden z-10"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <Crown className="text-[#D4AF37]" size={32} />
              </div>
              <Sparkles className="absolute -top-2 -right-2 text-[#D4AF37] animate-pulse" size={20} />
            </div>
            <h2 className="text-3xl font-serif font-light text-[#FAF9F6]">Sign In</h2>
            <p className="text-stone-400 mt-2">Enter your credentials to access your portal</p>
          </div>

          {signupSuccess && !error && (
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl mb-6 text-[10px] uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Account created successfully.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-[10px] uppercase tracking-widest flex items-center gap-2 border border-red-500/20">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white placeholder-stone-600 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-stone-300">Password</label>
                <a href="#" className="text-sm text-[#D4AF37] font-medium hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white placeholder-stone-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className={`relative group w-full py-5 text-sm font-bold transition-all shadow-2xl rounded-full overflow-hidden border-none ${
                loading
                  ? 'bg-[#800020] text-white'
                  : 'bg-[#D4AF37] text-black active:bg-[#800020] active:text-white'
              }`}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="relative flex items-center gap-2 justify-center uppercase tracking-[0.2em]">
                Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-stone-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#D4AF37] font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
