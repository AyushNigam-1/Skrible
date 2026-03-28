import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Inbox,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search as SearchIcon,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertCircle
} from "lucide-react";

import Loader from "../../components/layout/Loader";
import Search from "../../components/layout/Search";
import Dropdown, { DropdownOption } from "../../components/layout/Dropdown";
import ContributeModal from "../../components/modal/ContributeModal";
import { GET_FILTERED_REQUESTS } from "../../graphql/query/paragraphQueries";

// --- Types ---
type Paragraph = {
  id: string;
  text: string;
};

type Author = {
  id: string;
  name: string;
};

type RequestType = {
  id: string;
  text: string;
  createdAt?: string | number;
  author?: Author;
  likes?: string[];
  dislikes?: string[];
  comments?: any[];
  status?: string;
};

type FilteredRequestsData = {
  getFilteredRequests: RequestType[];
};

type OutletContextType = {
  request: RequestType | null;
  data: { getScriptById?: { id: string } };
  refetch: () => void;
};

const statusOptions: DropdownOption[] = [
  { id: "all", name: "All Statuses" },
  { id: "pending", name: "Pending" },
  { id: "approved", name: "Approved" },
  { id: "rejected", name: "Rejected" },
];

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const { data: scriptContextData } = useOutletContext<OutletContextType>();
  const scriptId = scriptContextData?.getScriptById?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<DropdownOption>(
    userId ? statusOptions[0] : statusOptions[1]
  );

  const queryVariables: any = { scriptId };
  if (userId) queryVariables.userId = userId;
  if (selectedStatus.id !== "all") queryVariables.status = selectedStatus.id.toLowerCase();

  const { data, loading, error, refetch } = useQuery<FilteredRequestsData>(
    GET_FILTERED_REQUESTS,
    {
      variables: queryVariables,
      skip: !scriptId,
      fetchPolicy: "cache-and-network",
    }
  );

  const rawParagraphs = data?.getFilteredRequests || [];
  const authorName = userId && rawParagraphs.length > 0 ? rawParagraphs[0].author?.name : null;

  useEffect(() => {
    if (userId && authorName && searchQuery === "") {
      setSearchQuery(`author:${authorName.toLowerCase().replace(/\s+/g, '-')}`);
    }
  }, [userId, authorName]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value === "" && userId) {
      searchParams.delete("userId");
      setSearchParams(searchParams);
      setSelectedStatus(statusOptions[1]);
    }
  };

  const clearUserFilter = () => {
    searchParams.delete("userId");
    setSearchParams(searchParams);
    setSearchQuery("");
    setSelectedStatus(statusOptions[1]);
  };

  const filteredParagraphs = useMemo(() => {
    let result = [...rawParagraphs];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!query.startsWith('author:')) {
        result = result.filter(
          (req) =>
            req.text?.toLowerCase().includes(query) ||
            req.author?.name?.toLowerCase().includes(query),
        );
      }
    }
    return result;
  }, [rawParagraphs, searchQuery]);

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(date);
  };

  const getStatusConfig = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { color: "text-green-400 bg-green-500/10 border-green-500/20", icon: CheckCircle, label: "Approved" };
      case "rejected":
        return { color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle, label: "Rejected" };
      default:
        return { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending" };
    }
  };

  // 🚨 THE FIX: Replaced simple variants with the synced stagger animation
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "tween", ease: "easeOut", duration: 0.4 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const isFiltering = searchQuery !== "" || selectedStatus.id !== "all" || userId;

  return (
    <div className="w-full flex-1 flex flex-col">
      <AnimatePresence mode="wait">
        {loading && !data ? (
          <div className="flex items-center justify-center w-full min-h-[50vh]"><Loader /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-red-400 font-mono text-sm max-w-md">
              Error loading requests. Check if your backend resolver handles the "status" parameter correctly.
            </p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 hover:bg-white/10 transition-all">Retry</button>
          </div>
        ) : rawParagraphs.length === 0 && !isFiltering ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-20 text-center space-y-4 font-mono min-h-[60vh]">
            <div className="bg-white/10 border border-white/20 p-4 rounded-full"><Inbox className="w-8 h-8 text-white" /></div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-sans">No requests yet</h3>
            <ContributeModal scriptId={scriptId} refetch={refetch} variant="empty" />
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col gap-6">

            {/* 🚨 THE FIX: Applied itemVariants to the search bar so it animates in sequence */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-4">
              <Search
                value={searchQuery}
                setSearch={handleSearchChange}
                placeholder={userId ? `Filtering by user...` : "Search requests..."}
                className="flex-1 min-w-0 sm:max-w-60"
              />
              <Dropdown
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                icon={Activity}
                className="w-auto shrink-0"
              />
            </motion.div>

            {filteredParagraphs.length === 0 ? (
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 text-gray-400 font-mono">
                <SearchIcon className="mb-4 opacity-20" size={48} />
                <p>No results found for this status.</p>
                <button onClick={clearUserFilter} className="mt-4 text-xs text-indigo-400 hover:underline">Clear all filters</button>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                <AnimatePresence mode="popLayout">
                  {filteredParagraphs.map((req) => {
                    const statusInfo = getStatusConfig(req.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <motion.div
                        layout
                        key={req.id}
                        variants={itemVariants} // 🚨 THE FIX: Replaced hardcoded animation with synced variants
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                        onClick={() => navigate(`/contribution/${scriptId}/${req.id}`)}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 transition-colors flex flex-col gap-4 relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold shadow-inner">
                              {req.author?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-bold text-white font-mono">{req.author?.name || "Unknown"}</p>
                              <p className="text-xs text-gray-500 font-mono">{formatDate(req.createdAt)}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            <span>{statusInfo.label}</span>
                          </div>
                        </div>
                        <div className="prose prose-sm dark:prose-invert text-gray-400 line-clamp-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{req.text}</ReactMarkdown>
                        </div>
                        <div className="flex items-center gap-6 text-gray-500 text-xs font-mono mt-auto pt-2">
                          <span className="flex items-center gap-1.5"><ThumbsUp size={14} /> {req.likes?.length || 0}</span>
                          <span className="flex items-center gap-1.5"><ThumbsDown size={14} /> {req.dislikes?.length || 0}</span>
                          <span className="flex items-center gap-1.5 ml-auto"><MessageSquare size={14} /> {req.comments?.length || 0}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Requests;