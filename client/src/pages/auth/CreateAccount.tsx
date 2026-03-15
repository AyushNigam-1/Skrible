import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Feather, Loader2, Mail, Lock, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { posthog } from "../../components/providers/PostHogProvider";
import { authClient } from "../../lib/authClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const CreateAccount: React.FC = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    const { data: authData, error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.username,
    });
    setLoading(false);

    if (error) {
      posthog.capture("signup_failed", { error_message: error.message || "unknown" });
      toast.error(error.message || "Failed to create account");
      return;
    }

    if (authData?.user) {
      localStorage.setItem("user", JSON.stringify({ id: authData.user.id, username: authData.user.name }));
      posthog.identify(authData.user.id, { username: authData.user.name });
      posthog.capture("user_signed_up", { signup_method: "email" });
      toast.success("Account created successfully!");
      nav("/");
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    await authClient.signIn.social({
      provider: provider,
      callbackURL: "http://localhost:5173/explore",
    });
    setLoading(false);
  };

  const inputWrapperClass = "relative flex flex-col w-full group";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors z-10";
  const floatingLabelClass = "absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:left-4 peer-focus:text-xs peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:bg-white dark:peer-focus:bg-[#11131A] peer-focus:px-2 peer-focus:rounded-full peer-valid:-top-2 peer-valid:translate-y-0 peer-valid:left-4 peer-valid:text-xs peer-valid:bg-white dark:peer-valid:bg-[#11131A] peer-valid:px-2 peer-valid:rounded-full pointer-events-none";

  const getInputClass = (hasError: boolean) =>
    `w-full pl-12 pr-4 py-3.5 rounded-2xl border ${hasError
      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/40"
      : "border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/40"
    } bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-2 transition-all outline-none placeholder:text-transparent peer shadow-sm dark:shadow-inner font-['Inter'] relative`;

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.97, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.0, staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto flex flex-col gap-8 p-6 sm:p-10 bg-white dark:bg-[#11131A]/80 dark:backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none hidden dark:block" />

      <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-3 relative z-10">
        <div className="bg-amber-50 dark:bg-white/5 border border-amber-100 dark:border-white/10 rounded-full p-4 shadow-sm mb-2">
          <Feather className="w-8 h-8 text-amber-600 dark:text-amber-100/80" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-['Playfair_Display'] tracking-tight">Join Skribe</h1>
        <p className="text-gray-500 dark:text-gray-400 font-['Literata'] text-sm sm:text-base">Start your journey and collaborate with writers worldwide.</p>
      </motion.div>

      {/* 🚨 UPDATED: Social Providers Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 relative z-10">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={loading}
          className="flex justify-center items-center gap-3 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-300 py-3.5 shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          disabled={loading}
          className="flex justify-center items-center gap-3 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-300 py-3.5 shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          <img src="/github.png" alt="Github" className="w-5 h-5 dark:invert" />
          Github
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4 relative z-10">
        <hr className="flex-grow border-gray-200 dark:border-white/10" />
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold font-['Inter']">OR EMAIL</span>
        <hr className="flex-grow border-gray-200 dark:border-white/10" />
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 relative z-10">
        <div className={inputWrapperClass}>
          <div className="relative w-full">
            <User className={iconClass} />
            <input type="text" id="username" required {...register("username")} className={getInputClass(!!errors.username)} />
            <label htmlFor="username" className={floatingLabelClass}>Username</label>
          </div>
          <AnimatePresence>
            {errors.username && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-500 text-xs mt-1.5 ml-2 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" /> {errors.username.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className={inputWrapperClass}>
          <div className="relative w-full">
            <Mail className={iconClass} />
            <input type="email" id="email" required {...register("email")} className={getInputClass(!!errors.email)} />
            <label htmlFor="email" className={floatingLabelClass}>Email Address</label>
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-500 text-xs mt-1.5 ml-2 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" /> {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className={inputWrapperClass}>
          <div className="relative w-full">
            <Lock className={iconClass} />
            <input type="password" id="password" required {...register("password")} className={getInputClass(!!errors.password)} />
            <label htmlFor="password" className={floatingLabelClass}>Password</label>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-500 text-xs mt-1.5 ml-2 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" /> {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button type="submit" disabled={loading || !isValid} className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black py-4 rounded-2xl transition-all duration-300 font-bold text-base shadow-lg shadow-gray-900/20 dark:shadow-white/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2 font-['Inter']">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
        </button>
      </motion.form>

      <motion.div variants={itemVariants} className="text-sm text-gray-500 dark:text-gray-400 text-center font-['Inter'] relative z-10 mt-2">
        <p>Already have an account? <Link to="/login" className="font-bold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline decoration-transparent hover:decoration-current underline-offset-4">Log in here</Link></p>
      </motion.div>
    </motion.div>
  );
};

export default CreateAccount;