import React, { useState, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Loader2, SearchX } from "lucide-react";
import Search from "../../components/layout/Search";
import ContributeModal from "../../components/modal/ContributeModal";
import { GetScriptByIdQuery } from "../../graphql/generated/graphql";

const highlightContent = (nodes: React.ReactNode, query: string): React.ReactNode => {
  if (!query.trim()) return nodes;
  return React.Children.map(nodes, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      const text = String(child);
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = text.split(regex);

      return (
        <>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <mark
                key={i}
                className="bg-amber-500/40 text-amber-50 rounded-[3px] px-1 font-semibold"
              >
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    }
    if (React.isValidElement(child)) {
      if (child.props && (child.props as any).children) {
        return React.cloneElement(child as React.ReactElement<any>, {
          children: highlightContent((child.props as any).children, query),
        });
      }
    }
    return child;
  });
};

const Timeline = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, refetch, loading } = useOutletContext<{
    data?: GetScriptByIdQuery;
    refetch: () => void;
    loading: boolean;
  }>();
  const scriptId = data?.getScriptById?.id;
  const rawParagraphs = data?.getScriptById?.paragraphs || [];

  const isArchived = data?.getScriptById?.visibility?.toLowerCase() === "archived";

  const processedParagraphs = useMemo(() => {
    let filtered = [...rawParagraphs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.author?.name?.toLowerCase().includes(query) ||
          p.text?.toLowerCase().includes(query),
      );
    }

    return filtered.sort(
      (a: any, b: any) => Number(b.createdAt) - Number(a.createdAt),
    );
  }, [rawParagraphs, searchQuery]);

  const markdownComponents = useMemo(() => ({
    p: ({ node, ...props }: any) => <p {...props} className="m-0 p-0">{highlightContent(props.children, searchQuery)}</p>,
    li: ({ node, ...props }: any) => <li {...props}>{highlightContent(props.children, searchQuery)}</li>,
    h1: ({ node, ...props }: any) => <h1 {...props}>{highlightContent(props.children, searchQuery)}</h1>,
    h2: ({ node, ...props }: any) => <h2 {...props}>{highlightContent(props.children, searchQuery)}</h2>,
    h3: ({ node, ...props }: any) => <h3 {...props}>{highlightContent(props.children, searchQuery)}</h3>,
    h4: ({ node, ...props }: any) => <h4 {...props}>{highlightContent(props.children, searchQuery)}</h4>,
    h5: ({ node, ...props }: any) => <h5 {...props}>{highlightContent(props.children, searchQuery)}</h5>,
    h6: ({ node, ...props }: any) => <h6 {...props}>{highlightContent(props.children, searchQuery)}</h6>,
    blockquote: ({ node, ...props }: any) => <blockquote {...props}>{highlightContent(props.children, searchQuery)}</blockquote>,
    th: ({ node, ...props }: any) => <th {...props}>{highlightContent(props.children, searchQuery)}</th>,
    td: ({ node, ...props }: any) => <td {...props}>{highlightContent(props.children, searchQuery)}</td>,
  }), [searchQuery]);

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center w-full min-h-[70vh]">
        <Loader2 className="size-8 shrink-0 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 w-full font-mono scrollbar-none"
    >
      {rawParagraphs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center px-4 sm:px-6 text-center min-h-[60vh] md:min-h-[78vh] space-y-4 relative overflow-hidden"
        >
          <div className="bg-white/5 border border-white/20 p-3 sm:p-4 rounded-full shadow-sm relative z-10">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 tracking-tight font-sans relative z-10">
            No contributions yet
          </h3>

          <p className="text-sm sm:text-base text-gray-400 max-w-xs sm:max-w-md relative z-10 leading-relaxed">
            This draft is currently empty. Be the first to add content and shape
            the draft!
          </p>

          {!isArchived && (
            <div className="pt-2 sm:pt-4 relative z-10">
              <ContributeModal scriptId={scriptId} refetch={refetch} variant="empty" />
            </div>
          )}
        </motion.div>
      )}

      {rawParagraphs.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center py-2 justify-between gap-3 w-full">
          <Search
            value={searchQuery}
            setSearch={setSearchQuery}
            placeholder="Search timeline..."
            className="w-full sm:max-w-60"
          />

          {!isArchived && (
            <div className="shrink-0">
              <ContributeModal scriptId={scriptId} refetch={refetch} variant="header" />
            </div>
          )}
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {processedParagraphs.length === 0 && rawParagraphs.length > 0 ? (
            <motion.div
              key="contributions-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center  text-center space-y-2 relative overflow-hidden font-sans w-full min-h-[60vh]"
            >
              <div className="bg-white/5 border border-white/20 p-4 rounded-full shadow-sm relative z-10">
                <SearchX className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white relative z-10">
                No results found
              </h3>

              <p className="text-gray-400 max-w-md relative z-10 text-sm">
                We couldn't find any results. Try adjusting your filters.
              </p>
            </motion.div>
          ) : (
            processedParagraphs.map((p: any) => (
              <motion.div key={p.id} variants={itemVariants} layout>
                <Link
                  to={`/contribution/${scriptId}/${p.id}`}
                  className="block bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all duration-300 group relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-inner group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                        {p.author.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-mono text-sm font-bold text-white tracking-tight truncate">
                        {highlightContent(p.author.name, searchQuery)}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500 tracking-wider shrink-0">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>

                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300 leading-relaxed w-full overflow-hidden break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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