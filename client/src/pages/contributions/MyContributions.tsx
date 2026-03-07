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
} from "lucide-react";
import { GET_USER_CONTRIBUTIONS } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Filters from "../../components/layout/Filters";
import Loader from "../../components/layout/Loader";

const MyContributions = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const { loading, error, data } = useQuery(GET_USER_CONTRIBUTIONS, {
    variables: { userId },
    skip: !userId,
  });

  const formatFancyDate = (dateString: string) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const statusConfig: Record<string, any> = {
    approved: {
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle,
    },
    pending: {
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: Clock,
    },
    rejected: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: XCircle,
    },
  };

  const contributions = data?.getUserContributions || [];

  const filteredContributions = contributions.filter((c: any) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-mono">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[90vh] gap-4"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[90vh] text-center"
          >
            <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Failed to load contributions
            </h2>
            <p className="text-gray-500 mt-2">{error.message}</p>
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
              className="flex flex-col md:flex-row justify-between items-center gap-4"
            >
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-sans">
                Contributions
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Search
                  setSearch={setSearchQuery}
                  placeholder="Search my text..."
                />
              </div>
            </motion.div>

            <motion.hr
              variants={itemVariants}
              className="border-gray-200 dark:border-gray-800"
            />

            {filteredContributions.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredContributions.map((contribution: any) => {
                  const status =
                    contribution.status?.toLowerCase() || "pending";
                  const StatusIcon = statusConfig[status]?.icon || Clock;
                  const statusColor =
                    statusConfig[status]?.color || statusConfig.pending.color;

                  return (
                    <motion.div variants={itemVariants} key={contribution.id}>
                      <Link
                        to={`/contribution/${contribution.id}`}
                        className="group flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 space-y-4 h-full"
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatFancyDate(contribution.createdAt)}
                          </span>
                        </div>

                        <div className="flex-1 bg-gray-50 dark:bg-black/40 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-inner">
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-4 font-sans leading-relaxed text-sm">
                            {contribution.text}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold">
                              <ThumbsUp className="w-4 h-4" />
                              {contribution.likes.length || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold">
                              <ThumbsDown className="w-4 h-4" />
                              {contribution.dislikes.length || 0}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold">
                            <MessageSquare className="w-4 h-4" />
                            {contribution.comments?.length || 0}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-white/5 shadow-sm"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                  <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-sans tracking-tight">
                  {searchQuery ? "No matches found" : "No contributions yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md font-sans leading-relaxed text-sm">
                  {searchQuery
                    ? "Try tweaking your search term."
                    : "You haven't submitted any drafts yet. Head over to the Explore page to find a story to collaborate on!"}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyContributions;
