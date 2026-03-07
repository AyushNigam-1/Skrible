import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";

import Loader from "../../components/layout/Loader";
import Search from "../../components/layout/Search";
import ContributeModal from "../../components/modal/ContributeModal";
import { EXPORT_DOCUMENT_QUERY } from "../../graphql/query/paragraphQueries";

// 1. Define the Interface for the Outlet Context
interface TimelineContext {
  data: any; // Ideally, replace 'any' with your generated 'GetScriptByIdQuery' type
  refetch: () => void;
  loading: boolean;
}

const Timeline = () => {
  // Use the typed context
  const { data, refetch, loading } = useOutletContext<TimelineContext>();
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);

  if (loading) return <Loader />;

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Sort and process paragraphs
  const paragraphs = [...(data?.getScriptById?.paragraphs || [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const groupedParagraphs = paragraphs.reduce(
    (groups: Record<string, any[]>, paragraph) => {
      const date = formatter.format(new Date(Number(paragraph.createdAt)));
      (groups[date] ||= []).push(paragraph);
      return groups;
    },
    {},
  );

  const sortedDates = Object.keys(groupedParagraphs);

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
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
      className="flex flex-col gap-6 w-full mx-auto pb-10 font-mono"
    >
      {/* --- Empty State --- */}
      {paragraphs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 relative overflow-hidden"
        >
          <div className="bg-white/10 border border-white/20 p-4 rounded-full shadow-sm relative z-10">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-sans relative z-10">
            No contributions yet
          </h3>
          <p className="text-gray-400 max-w-md mb-6 text-sm relative z-10">
            This draft is currently empty. Be the first to add content and shape
            the story!
          </p>

          <ContributeModal
            scriptId={data?.getScriptById?.id}
            combinedText={data?.getScriptById?.combinedText}
            refetch={refetch}
            variant="empty"
          />
        </motion.div>
      )}

      {/* --- Header with Search & Contribute --- */}
      {paragraphs.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <Search
            setSearch={setSearchQuery}
            placeholder="Search contributors..."
          />

          <ContributeModal
            scriptId={data?.getScriptById?.id}
            combinedText={data?.getScriptById?.combinedText}
            refetch={refetch}
            variant="header"
          />
        </motion.div>
      )}

      {/* --- Timeline List --- */}
      <div className="flex flex-col gap-8">
        <AnimatePresence>
          {sortedDates.map((date) => (
            <motion.div
              key={date}
              variants={itemVariants}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <hr className="flex-grow border-white/10" />
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider font-mono">
                  {date}
                </h4>
                <hr className="flex-grow border-white/10" />
              </div>

              {groupedParagraphs[date].map((p) => (
                <Link
                  key={p.id}
                  to={`/contribution/${p.id}`}
                  className="block bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-6 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold shadow-inner">
                      {p.author.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-mono text-sm font-bold text-white">
                      @{p.author.username}
                    </p>
                  </div>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {p.text}
                    </ReactMarkdown>
                  </div>
                </Link>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Timeline;
