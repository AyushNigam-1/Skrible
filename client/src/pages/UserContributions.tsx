import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Search as SearchIcon,
    XCircle,
    FileText,
    Clock,
    CheckCircle,
} from "lucide-react";

// IMPORTANT: Adjust this import path to wherever your frontend queries are defined
import { GET_USER_CONTRIBUTIONS_BY_SCRIPT } from "../graphql/query/scriptQueries";
import Loader from "../components/layout/Loader";
import Search from "../components/layout/Search";

const UserContributions = () => {
    // 🚨 FIX 1: Grabbing draftId from the URL exactly as defined in your Route
    const { draftId, userId } = useParams<{ draftId: string; userId: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const { data, loading, error } = useQuery(GET_USER_CONTRIBUTIONS_BY_SCRIPT, {
        // 🚨 FIX 2: Mapping draftId to the scriptId variable expected by the backend
        variables: { scriptId: draftId || "", userId: userId || "" },
        skip: !draftId || !userId,
        fetchPolicy: "cache-and-network",
    });

    const contributions = data?.getUserContributionsByScript || [];

    const filteredContributions = useMemo(() => {
        if (!searchQuery) return contributions;
        return contributions.filter((c: any) =>
            c.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contributions, searchQuery]);

    const formatDate = (timestamp?: string | number) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(Number(timestamp)));
    };

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return {
                    color: "text-green-400 bg-green-500/10 border-green-500/20",
                    icon: CheckCircle,
                    label: "Approved",
                };
            case "rejected":
                return {
                    color: "text-red-400 bg-red-500/10 border-red-500/20",
                    icon: XCircle,
                    label: "Rejected",
                };
            default:
                return {
                    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    icon: Clock,
                    label: "Pending",
                };
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const scriptTitle = contributions[0]?.script?.title || "Manuscript";
    const authorName = contributions[0]?.author?.name || "Author";

    return (
        <div className="w-full max-w-7xl mx-auto font-mono pb-12">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center w-full min-h-[80vh]"
                    >
                        <Loader />
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
                    >
                        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-full mb-6">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                            Failed to load contributions
                        </h2>
                        <p className="text-gray-400 text-sm">{error.message}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col gap-6 w-full"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                        >
                            <div className="flex items-center gap-3 justify-between w-full md:w-auto">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-full"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <h1 className="text-3xl font-extrabold font-sans text-white tracking-tight antialiased">
                                    {authorName.split(" ")[0]}'s Contributions
                                </h1>
                                <div className="md:hidden shrink-0">
                                    {/* <Filter /> */}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <div className="w-full sm:w-72">
                                    <Search setSearch={setSearchQuery} />
                                </div>
                                <div className="hidden md:block shrink-0">
                                    {/* <Filter /> */}
                                </div>
                            </div>
                        </motion.div>

                        <motion.hr variants={itemVariants} className="border-white/10" />

                        {filteredContributions.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                            >
                                {filteredContributions.map((contribution: any) => {
                                    const statusInfo = getStatusConfig(contribution.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <motion.div key={contribution.id} variants={itemVariants} layout>
                                            <Link
                                                // 🚨 FIX 3: Using draftId to securely build the preview URL
                                                to={`/preview/${draftId}/${contribution.id}`}
                                                className="group flex flex-col h-full bg-[#13131a] hover:bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300 overflow-hidden relative"
                                            >
                                                <div className="flex items-start justify-between mb-4 gap-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-inner">
                                                            {contribution.author.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-bold font-sans text-base leading-tight">
                                                                {contribution.author.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500 font-mono mt-0.5">
                                                                {formatDate(contribution.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${statusInfo.color}`}
                                                    >
                                                        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="translate-y-[1px]">{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 mb-5">
                                                    <p className="text-gray-300 line-clamp-4 text-sm md:text-base leading-relaxed font-sans group-hover:text-gray-200 transition-colors">
                                                        {contribution.text.replace(/^#+\s/gm, "")}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between text-gray-400 text-xs font-bold pt-1">
                                                    <div className="flex items-center gap-5">
                                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                            <ThumbsUp size={16} />
                                                            {contribution.likes?.length || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                            <ThumbsDown size={16} />
                                                            {contribution.dislikes?.length || 0}
                                                        </span>
                                                    </div>
                                                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                        <MessageSquare size={16} />
                                                        {contribution.comments?.length || 0}
                                                    </span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col items-center justify-center py-20 px-4 text-center"
                            >
                                <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-4">
                                    <FileText className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    No requests found
                                </h3>
                                <p className="text-gray-400 text-sm max-w-sm">
                                    {searchQuery
                                        ? `No matching contributions found for "${searchQuery}".`
                                        : "This user has not made any contributions to this manuscript yet."}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserContributions;