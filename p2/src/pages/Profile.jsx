import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Mail, Pencil, Phone, Save, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: ''
    });

    const safeName = typeof user?.name === 'string' ? user.name : '';
    const safePhoneNumber = typeof user?.phoneNumber === 'string' ? user.phoneNumber : '';

    useEffect(() => {
        if (user) {
            setFormData({
                name: safeName,
                phoneNumber: safePhoneNumber
            });
        }
    }, [user, safeName, safePhoneNumber]);

    if (!user) {
        return (
            <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6] flex items-center justify-center">
                <p className="text-xl">Please log in to view your profile.</p>
            </div>
        );
    }

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await updateUser({
                name: formData.name,
                phoneNumber: formData.phoneNumber
            });
            setIsEditing(false);
            setMessage('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Could not update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            phoneNumber: user.phoneNumber || ''
        });
        setIsEditing(false);
        setError('');
        setMessage('');
    };

    return (
        <div className="min-h-screen pt-40 pb-20 px-4 bg-[#11100F] text-[#FAF9F6]">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-serif font-light mb-4">Your Profile</h1>
                    <p className="text-stone-400 text-lg">Manage your personal details and membership information.</p>
                </motion.div>

                <Card className="p-8 md:p-12 shadow-2xl bg-white/5 border-white/10 backdrop-blur-xl space-y-8">
                    <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-6">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full bg-softGold/20 flex items-center justify-center text-softGold text-4xl font-bold">
                                {safeName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif font-light text-white">{safeName}</h2>
                                <p className="text-stone-400 text-md">{user.email}</p>
                            </div>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#D4AF37] text-black active:bg-[#800020] active:text-white border-none"
                            >
                                <Pencil size={18} /> Edit
                            </Button>
                        )}
                    </div>

                    {message && <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl p-4 text-sm">{message}</div>}
                    {error && <div className="bg-red-500/10 text-red-300 border border-red-500/20 rounded-xl p-4 text-sm">{error}</div>}

                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-stone-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-300 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-white"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={user.email}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-stone-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-3">
                                <Button
                                    type="submit"
                                    isLoading={saving}
                                    className="bg-[#D4AF37] text-black active:bg-[#800020] active:text-white border-none"
                                >
                                    <Save size={18} /> Save
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-white/10 text-white border border-white/10"
                                >
                                    <X size={18} /> Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3"><User size={20} className="text-softGold" /><span className="text-stone-300 font-semibold">Full Name:</span><span className="text-white">{safeName}</span></div>
                            <div className="flex items-center gap-3"><Mail size={20} className="text-softGold" /><span className="text-stone-300 font-semibold">Email:</span><span className="text-white">{user.email}</span></div>
                            <div className="flex items-center gap-3"><Phone size={20} className="text-softGold" /><span className="text-stone-300 font-semibold">Phone:</span><span className="text-white">{safePhoneNumber || 'Not added'}</span></div>
                            <div className="flex items-center gap-3"><Crown size={20} className="text-softGold" /><span className="text-stone-300 font-semibold">Role:</span><span className="text-white">{user.role}</span></div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Profile;
