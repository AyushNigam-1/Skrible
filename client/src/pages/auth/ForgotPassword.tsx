import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Feather, Loader2, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "../../lib/authClient";

const forgotSchema = z.object({
    email: z.email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotFormValues>({
        resolver: zodResolver(forgotSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: ForgotFormValues) => {
        setLoading(true);

        const { error } = await authClient.requestPasswordReset({
            email: data.email,
            redirectTo: "http://localhost:5173/reset-password",
        });

        setLoading(false);

        if (error) {
            toast.error(error.message || "Failed to send reset link");
            return;
        }

        setIsSent(true);
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none hidden dark:block" />

            {/* Back Button */}
            <motion.div variants={itemVariants} className="absolute top-6 left-6 z-20">
                <Link to="/login" className="flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full transition-colors h-10 w-10 shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-3 relative z-10 mt-6">
                <div className="bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-full p-4 shadow-sm mb-2">
                    {isSent ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400" strokeWidth={1.5} />
                    ) : (
                        <Feather className="w-8 h-8 text-blue-600 dark:text-amber-100/80" strokeWidth={1.5} />
                    )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-['Playfair_Display'] tracking-tight">
                    {isSent ? "Check your email" : "Reset Password"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-['Literata'] text-sm sm:text-base px-4">
                    {isSent
                        ? "We've sent a secure reset link. Please check your inbox and spam folder."
                        : "Enter your email address and we'll send you a link to reset your password."}
                </p>
            </motion.div>

            {!isSent && (
                <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 relative z-10 mt-4">
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

                    <button type="submit" disabled={loading || !isValid} className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black py-4 rounded-2xl transition-all duration-300 font-bold text-base shadow-lg shadow-gray-900/20 dark:shadow-white/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2 font-['Inter']">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                    </button>
                </motion.form>
            )}

            {isSent && (
                <motion.div variants={itemVariants} className="w-full relative z-10 mt-4">
                    <button onClick={() => setIsSent(false)} className="w-full flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white py-4 rounded-2xl transition-all duration-300 font-bold text-base active:scale-[0.98] font-['Inter'] border border-gray-200 dark:border-white/10">
                        Try a different email
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ForgotPassword;