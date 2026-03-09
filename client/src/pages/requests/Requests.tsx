import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { useOutletContext, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Inbox,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  ChevronDown,
  Check,
  Search as SearchIcon, // Renamed to avoid conflict if you have a component named Search
} from "lucide-react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import clsx from "clsx";

import Loader from "../../components/layout/Loader";
import { GET_PENDING_PARAGRAPHS } from "../../graphql/query/paragraphQueries";
import Search from "../../components/layout/Search";

// --- Types ---
type Paragraph = {
  id: string;
  text: string;
};

type Author = {
  username?: string;
};

type RequestType = {
  id?: string;
  text: string;
  createdAt?: string | number;
  author?: Author;
  likes?: string[];
  dislikes?: string[];
  comments?: any[];
};

type ScriptData = {
  getScriptById?: {
    id: string;
    paragraphs: Paragraph[];
  };
};

type PendingData = {
  getPendingParagraphs: RequestType[];
};

type OutletContextType = {
  request: RequestType | null;
  setRequest: (req: RequestType | null) => void;
  data: ScriptData;
  refetch: () => void;
  setTab: (tab: string) => void;
};

// --- Filter Configuration ---
const filterOptions = [
  { id: "newest", name: "Newest First" },
  { id: "oldest", name: "Oldest First" },
  { id: "most_liked", name: "Most Liked" },
  { id: "most_commented", name: "Most Discussed" },
];

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useOutletContext<OutletContextType>();

  const scriptId = data?.getScriptById?.id;

  const { data: pendingData, loading } = useQuery<PendingData>(
    GET_PENDING_PARAGRAPHS,
    {
      variables: { scriptId },
      skip: !scriptId,
    },
  );

  const pendingParagraphs = pendingData?.getPendingParagraphs || [];

  // --- Local State for Search & Filter ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  // --- Search & Filter Logic ---
  const filteredAndSortedParagraphs = useMemo(() => {
    let result = [...pendingParagraphs];

    // 1. Apply Search Filter (checks author username AND request text)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (req) =>
          req.text?.toLowerCase().includes(query) ||
          req.author?.username?.toLowerCase().includes(query),
      );
    }

    // 2. Apply Sorting
    result.sort((a, b) => {
      switch (selectedFilter.id) {
        case "newest":
          return Number(b.createdAt || 0) - Number(a.createdAt || 0);
        case "oldest":
          return Number(a.createdAt || 0) - Number(b.createdAt || 0);
        case "most_liked":
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case "most_commented":
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [pendingParagraphs, searchQuery, selectedFilter]);

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(Number(timestamp)));
  };

  // --- Animation variants ---
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-6" id="requests">
      {/* Header & Filter Section
        Only show the header if there are actually paragraphs to filter/search
      */}
      {!loading && pendingParagraphs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20  w-full max-w-7xl mx-auto"
        >
          {/* Custom Inline Search Bar matching your aesthetic */}
          <div className="w-full sm:w-56">
            <Search setSearch={setSearchQuery} placeholder="Search" />
          </div>

          {/* Sleek Headless UI Filter Dropdown */}
          <div className="w-full sm:w-48 relative">
            <Listbox value={selectedFilter} onChange={setSelectedFilter}>
              <ListboxButton className="flex w-full items-center justify-between gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-sm outline-none font-sans">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{selectedFilter.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
              </ListboxButton>

              <ListboxOptions
                transition
                className="absolute z-30 mt-2 w-full bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl outline-none overflow-hidden origin-top-right transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 font-sans"
              >
                {filterOptions.map((option) => (
                  <ListboxOption
                    key={option.id}
                    value={option}
                    className={({ active }) =>
                      clsx(
                        "relative cursor-pointer select-none py-3 pl-4 pr-10 transition-colors text-sm",
                        active ? "bg-white/5 text-white" : "text-gray-300",
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clsx(
                            "block truncate",
                            selected ? "font-bold text-white" : "font-medium",
                          )}
                        >
                          {option.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full min-h-[60vh]"
          >
            <Loader />
          </motion.div>
        ) : pendingParagraphs.length === 0 ? (
          /* Global Empty State (No open requests at all) */
          <motion.div
            key="empty-state-global"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-[#130f1c]/50 backdrop-blur-xl shadow-lg relative overflow-hidden max-w-3xl mx-auto w-full mt-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="bg-white/10 border border-white/20 p-4 rounded-full mb-5 shadow-sm relative z-10">
              <Inbox className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">
              No pending contributions
            </h3>
            <p className="text-gray-400 max-w-md text-sm relative z-10">
              There are currently no open requests. Wait for collaborators to
              propose new additions to this draft!
            </p>
          </motion.div>
        ) : filteredAndSortedParagraphs.length === 0 ? (
          /* Search Empty State (No matches found for search query) */
          <motion.div
            key="empty-state-search"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden max-w-3xl mx-auto w-full"
          >
            <div className="bg-white/10 border border-white/20 p-4 rounded-full mb-5 shadow-sm relative z-10">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">
              No results found
            </h3>
            <p className="text-gray-400 max-w-md text-sm relative z-10">
              We couldn't find any contributions matching "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          /* Feed */
          <motion.div
            key="feed"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            // Use filteredAndSortedParagraphs here instead of pendingParagraphs
            className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-10"
          >
            {filteredAndSortedParagraphs.map((req) => (
              <motion.div
                key={req.id}
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/preview/${scriptId}/${req.id}`)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold shadow-inner border border-white/10">
                    {req.author?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white font-mono">
                      {req.author?.username || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-400 font-mono">
                      {formatDate(req.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-400 line-clamp-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ children }) => (
                        <ul className="list-disc ml-5 mb-2">{children}</ul>
                      ),
                      p: ({ children }) => <p className="mb-0">{children}</p>,
                    }}
                  >
                    {req.text}
                  </ReactMarkdown>
                </div>

                <div className="flex items-center justify-between gap-6 text-gray-400 text-sm font-mono mt-auto">
                  <div className="flex items-center gap-6 ">
                    <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{req.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                      <ThumbsDown className="w-4 h-4" />
                      <span>{req.dislikes?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{req.comments?.length || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Requests;
