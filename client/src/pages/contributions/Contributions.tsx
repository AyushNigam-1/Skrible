import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Calendar,
  Globe2,
  Search as SearchIcon,
} from "lucide-react";
import { GET_USER_CONTRIBUTIONS } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";

const MyContributions = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const { loading, error, data } = useQuery(GET_USER_CONTRIBUTIONS, {
    variables: { userId },
    skip: !userId,
  });

  // Safe Date Parser
  const formatFancyDate = (dateString: string) => {
    if (!dateString) return "Unknown Date";

    const isNumeric = /^\d+$/.test(dateString);
    const date = isNumeric
      ? new Date(Number(dateString))
      : new Date(dateString);

    if (isNaN(date.getTime())) return "Unknown Date";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const statusConfig: Record<string, any> = {
    approved: {
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      icon: CheckCircle,
    },
    pending: {
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      icon: Clock,
    },
    rejected: {
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: XCircle,
    },
  };

  const contributions = data?.getUserContributions || [];

  const filteredContributions = contributions.filter((c: any) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-mono pb-10">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[98vh] gap-4"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-full mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white font-mono tracking-tight mb-2">
              Failed to load contributions
            </h2>
            <p className="text-gray-400 mt-2 text-sm max-w-sm">{error.message}</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex flex-col gap-6 w-full ${contributions.length === 0 ? 'min-h-[80vh] justify-center' : ''}`}
          >
            {/* Header Section - ONLY SHOW IF THERE ARE CONTRIBUTIONS */}
            {contributions.length > 0 && (
              <>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20 mt-4"
                >
                  <h3 className="text-3xl text-white font-sans font-extrabold shrink-0">
                    Contributions
                  </h3>

                  <Search
                    setSearch={setSearchQuery}
                    placeholder="Search your drafts..."
                    className="w-full sm:max-w-xs"
                  />
                </motion.div>

                <motion.hr
                  variants={itemVariants}
                  className="border-white/10 mt-2 mb-4"
                />
              </>
            )}

            {filteredContributions.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredContributions.map((contribution: any) => {
                  const status =
                    contribution.status?.toLowerCase() || "pending";
                  const StatusIcon = statusConfig[status]?.icon || Clock;
                  const statusColor =
                    statusConfig[status]?.color || statusConfig.pending.color;

                  return (
                    <motion.div
                      layout
                      variants={itemVariants}
                      key={contribution.id}
                    >
                      <Link
                        to={`/preview/${contribution.script.id}/${contribution.id}`}
                        className="group flex flex-col bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden relative gap-6"
                      >
                        {/* --- Header --- */}
                        <div className="flex justify-between items-center space-x-4">
                          <h4 className="font-extrabold font-sans truncate text-xl text-gray-100">
                            {contribution.script?.title}
                          </h4>
                          <span
                            className={`shrink-0 inline-flex items-center justify-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest leading-none border ${statusColor}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="translate-y-[1px]">{status}</span>
                          </span>
                        </div>

                        {/* --- Body --- */}
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/30 rounded-full group-hover:bg-white/30 transition-colors"></div>
                          <p className="text-gray-300 line-clamp-4 pl-4 group-hover:text-gray-200 transition-colors">
                            {contribution.text.replace(/^#+\s/gm, "")}
                          </p>
                        </div>

                        {/* --- Footer: Date & Stats --- */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex space-x-4">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold group-hover:text-gray-400 transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                              {contribution.likes?.length || 0}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold group-hover:text-gray-400 transition-colors">
                              <ThumbsDown className="w-4 h-4" />
                              {contribution.dislikes?.length || 0}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold group-hover:text-gray-400 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              {contribution.comments?.length || 0}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 leading-none">
                            <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
                            <span className="translate-y-[1px]">
                              {formatFancyDate(contribution.createdAt)}
                            </span>
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* --- Minimalist Empty State (Matching Screenshot 3) --- */
              <motion.div
                variants={itemVariants}
                className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4"
              >
                <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-6">
                  {searchQuery ? (
                    <SearchIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 font-mono tracking-tight">
                  {searchQuery ? "No Matches Found" : "No contributions yet"}
                </h3>

                <p className="text-gray-400 max-w-sm text-sm font-mono leading-relaxed mb-8">
                  {searchQuery
                    ? `No drafts matching "${searchQuery}". Try adjusting your search.`
                    : "You haven't submitted any drafts yet. Find a story to collaborate on and make your mark!"}
                </p>

                {!searchQuery && (
                  <Link
                    to="/explore"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl transition-all duration-300 font-bold text-sm active:scale-95"
                  >
                    <Globe2 className="w-4 h-4" />
                    Find a Story
                  </Link>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyContributions;