import React, { useState, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";

import Loader from "../../components/layout/Loader";
import Search from "../../components/layout/Search"; // Imported our reusable Search component
import ContributeModal from "../../components/modal/ContributeModal";
import { EXPORT_DOCUMENT_QUERY } from "../../graphql/query/paragraphQueries";

// 1. Define the Interface for the Outlet Context
interface TimelineContext {
  data: any;
  refetch: () => void;
  loading: boolean;
}

const Timeline = () => {
  const { data, refetch, loading } = useOutletContext<TimelineContext>();
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);

  if (loading) return <Loader />;

  // --- Filtering & Sorting Logic ---
  const rawParagraphs = data?.getScriptById?.paragraphs || [];

  const processedParagraphs = useMemo(() => {
    let filtered = [...rawParagraphs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.author?.username?.toLowerCase().includes(query) ||
          p.text?.toLowerCase().includes(query),
      );
    }

    // Sort Newest to Oldest sequentially
    return filtered.sort(
      (a: any, b: any) => Number(b.createdAt) - Number(a.createdAt),
    );
  }, [rawParagraphs, searchQuery]);

  // SAFE DATE PARSER (Formats to e.g., "Mar 8, 2026, 10:29 AM")
  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";
    const isNumeric = /^\d+$/.test(String(timestamp));
    const date = isNumeric ? new Date(Number(timestamp)) : new Date(timestamp);

    if (isNaN(date.getTime())) return "Unknown Date";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6 w-full mx-auto pb-10 font-mono scrollbar-none"
    >
      {/* --- Empty State --- */}
      {rawParagraphs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 px-4 text-center  space-y-4 relative overflow-hidden"
        >
          <div className="bg-white/10 border border-white/20 p-4 rounded-full shadow-sm relative z-10">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white relative z-10">
            No contributions yet
          </h3>
          <p className="text-gray-400 max-w-md relative z-10">
            This draft is currently empty. Be the first to add content and shape
            the story!
          </p>
          <ContributeModal
            scriptId={data?.getScriptById?.id}
            refetch={refetch}
            variant="empty"
          />
        </motion.div>
      )}

      {/* --- Header with Search & Contribute Action Bar --- */}
      {rawParagraphs.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between gap-3 w-full"
        >
          <Search
            setSearch={setSearchQuery}
            placeholder="Search timeline..."
            className="w-full sm:max-w-60"
          />

          <div className="shrink-0">
            <ContributeModal
              scriptId={data?.getScriptById?.id}
              refetch={refetch}
              variant="header"
            />
          </div>
        </motion.div>
      )}

      {/* --- Timeline List (Sequential) --- */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {processedParagraphs.length === 0 && rawParagraphs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 py-10"
            >
              No contributions match your search.
            </motion.div>
          ) : (
            processedParagraphs.map((p: any) => (
              <motion.div key={p.id} variants={itemVariants} layout>
                <Link
                  to={`/contribution/${p.id}`}
                  className="block bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all duration-300 group relative"
                >
                  {/* --- Card Header: User left, Date right --- */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-inner group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                        {p.author.username.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-mono text-sm font-bold text-white tracking-tight truncate">
                        @{p.author.username}
                      </p>
                    </div>

                    {/* Date inside the top right corner */}
                    <span className="text-xs text-gray-500 tracking-wider shrink-0">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>

                  {/* --- Card Body --- */}
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300 leading-relaxed ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {p.text}
                    </ReactMarkdown>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Timeline;
