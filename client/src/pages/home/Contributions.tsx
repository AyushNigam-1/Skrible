import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  Globe2,
  SearchX,
  ListFilter,
  FileExclamationPoint,
  Lock
} from "lucide-react";
import { GET_USER_CONTRIBUTIONS } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Dropdown, { DropdownOption } from "../../components/layout/Dropdown";
import Loader from "../../components/layout/Loader";
import { useUserStore } from "../../store/useAuthStore";

const FILTER_OPTIONS = [
  { id: "all", name: "All Drafts" },
  { id: "approved", name: "Has Approved" },
  { id: "pending", name: "Has Pending" },
  { id: "rejected", name: "Has Rejected" },
];

const MyContributions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(FILTER_OPTIONS[0]);

  const { user } = useUserStore();
  const currentUserId = user?.id;

  const [showAuthWarning, setShowAuthWarning] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      const timer = setTimeout(() => setShowAuthWarning(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowAuthWarning(false);
    }
  }, [currentUserId]);

  const { loading, error, data } = useQuery(GET_USER_CONTRIBUTIONS, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
    fetchPolicy: "cache-and-network",
  });

  const formatFancyDate = (dateString: string | number) => {
    if (!dateString) return "UNKNOWN DATE";
    const isNumeric = /^\d+$/.test(String(dateString));
    const date = isNumeric ? new Date(Number(dateString)) : new Date(dateString);
    if (isNaN(date.getTime())) return "UNKNOWN DATE";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date).toUpperCase();
  };

  const contributions = data?.getUserContributions || [];
  const hasAnyContributions = contributions.length > 0;

  const groupedDrafts = useMemo(() => {
    const map = new Map();
    contributions.forEach((c: any) => {
      if (!c.script) return;
      const scriptId = c.script.id;

      if (!map.has(scriptId)) {
        map.set(scriptId, {
          script: c.script,
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          latestDate: c.createdAt,
        });
      }

      const group = map.get(scriptId);
      group.total += 1;
      const status = c.status?.toLowerCase() || "pending";
      if (status === "approved") group.approved += 1;
      else if (status === "rejected") group.rejected += 1;
      else group.pending += 1;

      if (Number(c.createdAt) > Number(group.latestDate)) {
        group.latestDate = c.createdAt;
      }
    });

    let result = Array.from(map.values());

    if (searchQuery) {
      result = result.filter((g) =>
        g.script.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter.id !== "all") {
      result = result.filter((g) => {
        if (selectedFilter.id === "approved") return g.approved > 0;
        if (selectedFilter.id === "pending") return g.pending > 0;
        if (selectedFilter.id === "rejected") return g.rejected > 0;
        return true;
      });
    }

    result.sort((a, b) => Number(b.latestDate) - Number(a.latestDate));
    return result;
  }, [contributions, searchQuery, selectedFilter]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "tween", ease: "easeOut", duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const isFiltering = searchQuery !== "" || selectedFilter.id !== "all";

  // 🚨 THE FIX: No more early returns! Everything happens inside the single AnimatePresence tree.
  return (
    <div className="w-full h-full text-white max-w-7xl mx-auto pb-10">
      <AnimatePresence mode="wait">

        {/* State 1: unified loading state (handles both auth hydrating AND data fetching) */}
        {(!currentUserId && !showAuthWarning) || loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[96vh]"
          >
            <Loader />
          </motion.div>
        ) :

          /* State 2: Auth Warning (Shows gracefully only if not logged in after 800ms) */
          !currentUserId && showAuthWarning ? (
            <motion.div
              key="auth-warning"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center w-full min-h-[96vh] px-4"
            >
              <div className="flex flex-col items-center justify-center text-center max-w-md w-full">
                <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-6">
                  <Lock className="w-8 h-8 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">
                  Authentication Required
                </h2>
                <p className="text-gray-400 text-sm font-mono leading-relaxed mb-8 max-w-[280px]">
                  Please sign in to view and manage your contributions.
                </p>
                <Link
                  to="/login"
                  className="flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl transition-all duration-300 font-bold text-sm active:scale-95"
                >
                  Sign In to Continue
                </Link>
              </div>
            </motion.div>
          ) :

            /* State 3: Error */
            error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[96vh] text-center px-4"
              >
                <XCircle className="w-8 h-8 text-red-500 mb-3" />
                <h2 className="text-base font-bold text-white mb-1">Failed to load contributions</h2>
                <p className="text-gray-400 text-sm font-mono max-w-sm">{error.message}</p>
              </motion.div>
            ) :

              /* State 4: Data Loaded (Empty or Filled) */
              (
                <motion.div
                  key="content"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col w-full gap-5"
                >
                  {(hasAnyContributions || isFiltering) && (
                    <>
                      <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-[1fr_auto] gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4 w-full"
                      >
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight self-center">
                          Contributions
                        </h1>

                        <div className="contents sm:flex sm:flex-row sm:items-center sm:gap-3">
                          <div className="col-span-2 order-last sm:order-none w-full sm:w-64">
                            <Search value={searchQuery} setSearch={setSearchQuery} placeholder="Search drafts..." />
                          </div>

                          <div className="shrink-0 sm:w-44 self-center">
                            <Dropdown
                              options={FILTER_OPTIONS}
                              value={selectedFilter}
                              onChange={setSelectedFilter}
                              icon={ListFilter}
                              collapseOnMobile={true}
                              className="w-auto shrink-0"
                            />
                          </div>
                        </div>
                      </motion.div>

                      <motion.hr variants={itemVariants} className="border border-white/5" />
                    </>
                  )}

                  {groupedDrafts.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                      {groupedDrafts.map((group) => (
                        <motion.div layout variants={itemVariants} key={group.script.id}>
                          <Link
                            to={`/requests/${group.script.id}?userId=${currentUserId}`}
                            className="group flex flex-col gap-4 h-full bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-col gap-2 min-w-0">
                                <h3 className="font-extrabold text-white text-xl md:text-2xl truncate font-sans tracking-tight">
                                  {group.script.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                  ~ LAST SUBMIT: {formatFancyDate(group.latestDate)}
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center justify-center px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] sm:text-xs text-gray-400 font-mono font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors mt-0.5">
                                {group.total} TOTAL
                              </div>
                            </div>

                            <div className="text-gray-400 line-clamp-3 leading-relaxed flex-grow font-mono group-hover:text-gray-300 transition-colors mt-1 mb-2">
                              View all your contributions, feedback, and edits submitted to this draft.
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/[0.08] transition-colors">
                                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest leading-none">
                                  <Clock size={14} className="text-gray-400 shrink-0" />
                                  <span className="mt-[1px]">Pending</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 leading-none">{group.pending}</span>
                              </div>

                              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/[0.08] transition-colors">
                                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest leading-none">
                                  <CheckCircle size={14} className="text-gray-400 shrink-0" />
                                  <span className="mt-[1px]">Active</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 leading-none">{group.approved}</span>
                              </div>

                              {group.rejected > 0 && (
                                <div className="col-span-2 flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-colors mt-1">
                                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 uppercase tracking-widest leading-none">
                                    <XCircle size={14} className="text-red-500/70 shrink-0" />
                                    <span className="mt-[1px]">Rejected</span>
                                  </div>
                                  <span className="text-xs font-bold text-red-500/90 leading-none">{group.rejected}</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col gap-4 items-center justify-center py-24 text-center min-h-[96vh]"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                        {isFiltering ? (
                          <SearchX className="w-10 h-10 text-gray-400" />
                        ) : (
                          <FileExclamationPoint className="w-10 h-10 text-gray-400" />
                        )}
                      </div>

                      <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans">
                        {isFiltering ? "No Drafts Found" : "No Contributions Yet"}
                      </h3>

                      <p className="text-gray-400 max-w-md text-base leading-relaxed relative z-10 font-mono">
                        {isFiltering
                          ? "We couldn't find any drafts matching your current search or status filters. Try adjusting them!"
                          : "You haven't submitted any drafts yet. Find a story to collaborate on and make your mark!"}
                      </p>

                      {!isFiltering && (
                        <Link
                          to="/explore"
                          className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-bold font-sans active:scale-95"
                        >
                          <Globe2 className="w-4 h-4" />
                          Explore
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