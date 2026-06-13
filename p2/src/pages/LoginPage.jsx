import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Assuming react-router-dom is used for navigation

const LoginPage = () => {
    return (
        <div className="min-h-screen relative bg-richBlack text-whiteSmoke font-sans selection:bg-softGold/30">
            {/* Background Image and Overlays */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/luxury_event_bg.png" // Assuming you have a background image here
                    alt="Luxury Event Backdrop"
                    className="w-full h-full object-cover opacity-35 scale-105"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-tr from-richBlack/70 to-transparent"></div>

                {/* Existing Fancy Background Graphics */}
                <motion.div
                    animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-richBlack/40 blur-[140px] pointer-events-none"
                />
                <motion.div
                    animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-amber-900/10 blur-[150px] pointer-events-none"
                />
            </div>

            {/* Golden Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-softGold px-8 py-4 flex justify-between items-center shadow-2xl">
                <Link to="/dashboard" className="text-richBlack font-serif text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                    LUXE
                </Link>
                <div className="flex gap-8 text-richBlack font-medium uppercase text-xs tracking-widest">
                    <Link to="/dashboard" className="hover:opacity-70 transition-opacity">Home</Link>
                    <Link to="/collections" className="hover:opacity-70 transition-opacity">Collections</Link>
                    <Link to="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
                    {/* "Get Started" button removed */}
                </div>
            </nav>

            <main className="relative flex flex-col items-center justify-center min-h-screen pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-xl p-16 bg-black/60 backdrop-blur-2xl border border-softGold/20 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]" // Increased size, darker glass, and premium border
                >
                    <h2 className="text-4xl font-serif font-light text-whiteSmoke text-center mb-8 tracking-tight">
                        Welcome Back
                    </h2>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] text-softGold font-semibold">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-richBlack/50 border border-white/10 p-4 rounded-lg focus:outline-none focus:border-softGold transition-colors font-light"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] text-softGold font-semibold">Password</label>
                            <input
                                type="password"
                                className="w-full bg-richBlack/50 border border-white/10 p-4 rounded-lg focus:outline-none focus:border-softGold transition-colors font-light"
                                placeholder="••••••••"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 mt-4 bg-[#D4AF37] text-black active:bg-[#800020] font-bold uppercase tracking-widest text-sm rounded-lg transition-all"
                        >
                            Sign In
                        </motion.button>
                    </form>

                    <p className="mt-8 text-center text-sm font-light text-whiteSmoke/40 tracking-wide">
                        Don't have an account? <Link to="/signup" className="text-softGold cursor-pointer hover:underline underline-offset-4">Join the club</Link>
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default LoginPage;