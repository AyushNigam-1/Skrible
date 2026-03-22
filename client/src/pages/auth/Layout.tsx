import { Outlet, Link } from "react-router-dom";
import { Feather } from "lucide-react";
import { motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-[#0A0A12] font-sans text-gray-200 selection:bg-amber-500/30 overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden bg-[#0A0A12] border-r border-white/10 p-12 xl:p-20 z-10">

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"
        />

        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <Link
            to="/"
            className="inline-block transition-transform hover:scale-105 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-md shadow-lg">
                <Feather
                  className="w-6 h-6 text-amber-500"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Skribe
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative z-10 max-w-lg mb-10"
        >
          <blockquote className="space-y-6">
            <p className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              "There is no greater agony than bearing an untold story inside
              you."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-10 h-px bg-white/20" />
              <span className="text-gray-500 font-mono tracking-widest text-xs uppercase font-bold">
                Maya Angelou
              </span>
            </footer>
          </blockquote>
        </motion.div>
      </div>
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col items-center justify-center relative px-6 py-12 sm:px-12 lg:px-16 z-20 bg-[#0A0A12]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:hidden absolute top-8 left-8 z-30"
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-lg border border-white/10">
              <Feather
                className="w-5 h-5 text-amber-500"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Skribe
            </span>
          </Link>
        </motion.div>

        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-transparent to-[#0A0A12] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md relative z-30"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;