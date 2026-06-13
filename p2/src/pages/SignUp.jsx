import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext is correctly implemented
import { motion } from 'framer-motion';
import { User, Mail, Lock, Crown, ShieldCheck, Phone } from 'lucide-react';
import Button from '../components/ui/Button';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setError('');
    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role
      });
      navigate('/login', { state: { signupSuccess: true, registeredEmail: formData.email } });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[#11100F]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-1/2 bg-black/40 p-12 text-white flex flex-col justify-between border-r border-white/5">
          <div>
            <Crown className="text-[#D4AF37] mb-8" size={40} />
            <h2 className="text-3xl font-serif font-light mb-6 text-[#FAF9F6]">Professional Planning Awaits</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-stone-400">
                <ShieldCheck className="text-[#D4AF37]" size={20} />
                Advanced Scheduling Tools
              </li>
              <li className="flex items-center gap-3 text-stone-400">
                <ShieldCheck className="text-[#D4AF37]" size={20} />
                Signature Venue Database
              </li>
              <li className="flex items-center gap-3 text-stone-400">
                <ShieldCheck className="text-[#D4AF37]" size={20} />
                Collaborative Team Access
              </li>
            </ul>
          </div>
          <div className="text-stone-500 text-sm italic">
            "The ultimate destination for luxury management." - Luxe Magazine
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-serif font-light text-[#FAF9F6] mb-8">Sign Up</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                  placeholder="Alexander Knight"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-300 mb-1">Account Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
              >
                <option className="bg-[#11100F]" value="1">User</option>
                <option className="bg-[#11100F]" value="2">Admin</option>
                <option className="bg-[#11100F]" value="3">Manager</option>
              </select>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className={`w-full py-4 font-bold text-black transition-all ${
                loading
                  ? 'bg-[#800020] text-white'
                  : 'bg-[#D4AF37] hover:bg-[#B8941F] active:bg-[#800020] active:text-white'
              }`}
            >
              Sign Up
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#D4AF37] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
