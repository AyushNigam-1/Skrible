import { Outlet, Link } from "react-router-dom";
import { Feather } from "lucide-react";
import { motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-primary font-sans text-gray-200 selection:bg-white/20 overflow-hidden relative">

      {/* --- GLOBAL SEAMLESS BACKGROUND --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Subtle Ambient Glow */}
      <div className="absolute left-1/4 top-1/4 z-0 h-[600px] w-[600px] rounded-full bg-white opacity-[0.02] blur-[150px] pointer-events-none" />

      {/* --- Left Panel (Hidden on Mobile) --- */}
      {/* 🚨 THE FIX: Changed justify-between to justify-center and added gap-20 */}
      <div className="hidden lg:flex flex-col justify-center gap-20 flex-1 relative p-12 xl:p-20 z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link
            to="/"
            className="inline-block transition-opacity hover:opacity-80 duration-300"
          >
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-28 lg:w-32 brightness-110 drop-shadow-sm"
              />
            </div>
          </Link>
        </motion.div>

        {/* Clean Typographic Feature */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-lg mb-10"
        >
          <div className="space-y-6">

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
              Join the Workspace
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              The collaborative canvas for modern writers.
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 text-base xl:text-lg leading-relaxed max-w-md">
              Shape narratives, co-author manuscripts, and build entire worlds together in real-time. Where your best stories come to life.
            </p>
          </div>
        </motion.div>
      </div>

      {/* --- Right Panel (Form Container) --- */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col items-center justify-center relative px-6 py-12 sm:px-12 lg:px-16 z-20">

        {/* Mobile Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:hidden absolute top-8 left-8"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-white/5 p-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <Feather
                className="w-4 h-4 text-white"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Skribe
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-md relative z-30"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;