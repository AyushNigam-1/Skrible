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
} from "lucide-react";
import { GET_USER_CONTRIBUTIONS } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";
import { useUserStore } from "../../store/useAuthStore";

const MyContributions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUserStore();

  const { loading, error, data } = useQuery(GET_USER_CONTRIBUTIONS, {
    variables: { userId: user!.id },
    skip: !user?.id,
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
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div className="w-full h-full text-white max-w-7xl mx-auto  pb-10">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[60vh]"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
          >
            <XCircle className="w-8 h-8 text-red-500 mb-3" />
            <h2 className="text-base font-bold text-white mb-1">Failed to load contributions</h2>
            <p className="text-gray-400 text-sm font-mono max-w-sm">{error.message}</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col w-full gap-5"
          >
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
              <div className="w-full sm:w-64">
                <Search setSearch={setSearchQuery} placeholder="Search drafts..." />
              </div>
            </div>
            <hr className="border border-white/5" />
            {/* --- GRID OF CARDS --- */}
            {groupedDrafts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {groupedDrafts.map((group) => (
                  <motion.div layout variants={itemVariants} key={group.script.id}>
                    <Link
                      to={`/contributions/${group.script.id}/${user?.id}`}
                      className="group flex flex-col gap-4 h-full bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-[#16161e] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-black/20 "
                    >
                      {/* Card Header & Total Badge */}
                      <div className="flex items-start justify-between gap-4 ">
                        <h3 className="font-bold text-white text-2xl line-clamp-1 tracking-tight">
                          {group.script.title}
                        </h3>
                        <div className="shrink-0 flex items-center justify-center px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[10px] text-gray-400 font-mono font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                          {group.total} TOTAL
                        </div>
                      </div>

                      {/* Date Row */}
                      <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                        LAST SUBMIT: {formatFancyDate(group.latestDate)}
                      </div>
                      <div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto nobis esse ut nesciunt
                      </div>
                      {/* <div className="flex-1" /> */}

                      {/* --- Sleek Profile-Style Stats Dashboard --- */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">

                        {/* Pending Stat Box */}
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/[0.04] transition-colors">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                            <Clock size={12} className="text-amber-500/70" /> Pending
                          </div>
                          <span className="text-xs font-bold text-amber-500/90">{group.pending}</span>
                        </div>

                        {/* Active Stat Box */}
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/[0.04] transition-colors">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                            <CheckCircle size={12} className="text-green-500/70" /> Active
                          </div>
                          <span className="text-xs font-bold text-green-500/90">{group.approved}</span>
                        </div>

                        {/* Rejected Stat Box (Only shows if there are rejections, spans full width to keep grid clean) */}
                        {group.rejected > 0 && (
                          <div className="col-span-2 flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-colors mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                              <XCircle size={12} className="text-red-500/70" /> Rejected
                            </div>
                            <span className="text-xs font-bold text-red-500/90">{group.rejected}</span>
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
                className="flex flex-col items-center justify-center py-24 text-center border border-white/5 border-dashed rounded-xl bg-[#13131a]/50"
              >
                <FileText className="w-6 h-6 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  {searchQuery ? "No matches found" : "No contributions yet"}
                </h3>
                <p className="text-gray-500 text-sm font-mono max-w-sm mb-6">
                  {searchQuery
                    ? `No manuscripts matching "${searchQuery}".`
                    : "You haven't submitted any drafts yet."}
                </p>

                {!searchQuery && (
                  <Link
                    to="/explore"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg transition-colors font-bold"
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