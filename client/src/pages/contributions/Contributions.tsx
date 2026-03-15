import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
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
    fetchPolicy: "cache-and-network",
  });

  // Safe Date Parser
  const formatFancyDate = (dateString: string | number) => {
    if (!dateString) return "Unknown Date";

    const isNumeric = /^\d+$/.test(String(dateString));
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

  const contributions = data?.getUserContributions || [];

  // --- Group Contributions by Script ---
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

    result.sort((a, b) => Number(b.latestDate) - Number(a.latestDate));

    return result;
  }, [contributions, searchQuery]);

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
      transition: { duration: 0.5, ease: "easeOut" },
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
            className="flex flex-col items-center justify-center w-full min-h-[80vh] gap-4"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
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
            className={`flex flex-col gap-6 w-full ${groupedDrafts.length === 0 && !searchQuery ? 'min-h-[80vh] justify-center' : ''}`}
          >
            {contributions.length > 0 && (
              <>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20"
                >
                  <h3 className="text-3xl text-white font-sans font-extrabold shrink-0 tracking-tight">
                    My Drafts
                  </h3>

                  <Search
                    setSearch={setSearchQuery}
                    placeholder="Search manuscripts..."
                    className="w-full sm:max-w-xs"
                  />
                </motion.div>
                <motion.hr variants={itemVariants} className="border-white/10" />
              </>
            )}

            {groupedDrafts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans"
              >
                {groupedDrafts.map((group) => (
                  <motion.div layout variants={itemVariants} key={group.script.id}>
                    <Link
                      to={`/contributions/${group.script.id}/${userId}`}
                      className="group flex flex-col justify-between bg-[#13131a] hover:bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-300 min-h-[140px] h-full"
                    >
                      {/* --- Top Half: Title & Minimal Badge --- */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-lg font-extrabold text-white line-clamp-1 group-hover:text-gray-200 transition-colors tracking-tight">
                            {group.script.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">
                            Active ~ {formatFancyDate(group.latestDate)}
                          </span>
                        </div>

                        {/* Ultra-Minimal Count Badge */}
                        <div className="shrink-0 flex items-center justify-center px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold font-mono text-gray-300 group-hover:bg-white/10 transition-colors">
                          {group.total} {group.total === 1 ? 'DRAFT' : 'DRAFTS'}
                        </div>
                      </div>

                      {/* --- Bottom Half: Subtle Status Tally --- */}
                      <div className="flex items-center gap-4 mt-6">
                        {group.approved > 0 && (
                          <div className="flex items-center gap-1.5 text-green-500/70 text-xs font-bold font-mono" title={`${group.approved} Approved`}>
                            <CheckCircle size={14} /> <span>{group.approved}</span>
                          </div>
                        )}
                        {group.pending > 0 && (
                          <div className="flex items-center gap-1.5 text-amber-500/70 text-xs font-bold font-mono" title={`${group.pending} Pending`}>
                            <Clock size={14} /> <span>{group.pending}</span>
                          </div>
                        )}
                        {group.rejected > 0 && (
                          <div className="flex items-center gap-1.5 text-red-500/70 text-xs font-bold font-mono" title={`${group.rejected} Rejected`}>
                            <XCircle size={14} /> <span>{group.rejected}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4"
              >
                <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-4">
                  {searchQuery ? (
                    <SearchIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white font-mono">
                  {searchQuery ? "No Matches Found" : "No contributions yet"}
                </h3>

                <p className="text-gray-400 max-w-sm text-sm font-mono mt-2">
                  {searchQuery
                    ? `No manuscripts matching "${searchQuery}". Try adjusting your search.`
                    : "You haven't submitted any drafts yet. Find a story to collaborate on and make your mark!"}
                </p>

                {!searchQuery && (
                  <Link
                    to="/explore"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 font-bold shadow-sm active:scale-95 font-sans mt-6"
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