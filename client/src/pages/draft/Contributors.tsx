import React, { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Users, Trophy, Medal, Filter, SearchX, Loader2, ListFilter } from "lucide-react";
import Search from "../../components/layout/Search";
import Dropdown from "../../components/layout/Dropdown";
import { DropdownOption } from "../../types";
import { GetScriptByIdQuery } from "../../graphql/generated/graphql";

interface Contributor {
  id: string;
  name: string;
  count: number;
}

const filterOptions: DropdownOption[] = [
  { id: 1, name: "Highest First" },
  { id: 2, name: "Lowest First" },
  { id: 3, name: "A-Z" },
];

const Contributors: React.FC = () => {

  const { data, loading } = useOutletContext<{
    data?: GetScriptByIdQuery;
    loading: boolean;
  }>();

  const paragraphs = data?.getScriptById?.paragraphs || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(
    filterOptions[0],
  );

  const contributorsLeaderboard = useMemo(() => {
    const grouped: Record<string, Contributor> = {};

    paragraphs.forEach((item) => {
      const name = item.author?.name;
      const id = item.author?.id;

      if (!name || !id) return;

      if (!grouped[name]) {
        grouped[name] = { id, name, count: 0 };
      }
      grouped[name].count += 1;
    });

    let result = Object.values(grouped);

    // 2. Search Filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(lowerQuery),
      );
    }

    // 3. Sort based on selected filter
    result.sort((a, b) => {
      if (selectedFilter.name === "Highest First") return b.count - a.count;
      if (selectedFilter.name === "Lowest First") return a.count - b.count;
      if (selectedFilter.name === "A-Z")
        return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [paragraphs, searchQuery, selectedFilter]);

  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
  };

  // Helper to render special icons/colors for the Top 3
  const renderRankBadge = (index: number) => {
    if (selectedFilter.name !== "Highest First") {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-transparent text-gray-500 font-bold font-mono rounded-full border border-white/10">
          #{index + 1}
        </div>
      );
    }

    if (index === 0)
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-white text-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]">
          <Trophy className="w-5 h-5" />
        </div>
      );
    if (index === 1)
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 text-white rounded-full shadow-sm border border-white/30">
          <Medal className="w-5 h-5" />
        </div>
      );
    if (index === 2)
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 text-gray-300 rounded-full shadow-sm border border-white/10">
          <Medal className="w-5 h-5" />
        </div>
      );

    return (
      <div className="flex items-center justify-center w-10 h-10 bg-transparent text-gray-500 font-bold font-mono rounded-full border border-white/10">
        #{index + 1}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh]">
        <Loader2 className="size-8 shrink-0 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 w-full mx-auto font-mono"
    >
      {paragraphs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[78vh] px-4 sm:px-6 text-center space-y-4 sm:space-y-5 relative overflow-hidden"
        >
          <div className="bg-white/5 border border-white/20 p-3 sm:p-4 rounded-full shadow-sm relative z-10">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 tracking-tight font-sans relative z-10">
            No contributors yet
          </h3>

          <p className="text-sm sm:text-base text-gray-400 max-w-xs sm:max-w-md relative z-10 leading-relaxed">
            This draft doesn't have any approved contributions right now.
          </p>

        </motion.div>
      )}

      {paragraphs.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between gap-3 py-2 relative z-20 w-full"
        >
          <Search
            value={searchQuery}
            setSearch={setSearchQuery}
            placeholder="Search users..."
            className="flex-1 min-w-0 sm:max-w-60"
          />

          <Dropdown
            options={filterOptions}
            value={selectedFilter}
            onChange={setSelectedFilter}
            icon={ListFilter}
            className="w-auto shrink-0"
            collapseOnMobile={true}
          />
        </motion.div>
      )}

      {paragraphs.length > 0 && (
        <AnimatePresence mode="wait">
          {contributorsLeaderboard.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {contributorsLeaderboard.map((contributor, index) => (
                <motion.div variants={itemVariants} key={contributor.name}>
                  <Link
                    // --- UPDATED ROUTE ---
                    to={`/profile/${contributor.id}`}
                    className="group flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-white/5 hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg font-bold shadow-inner shrink-0 transition-transform group-hover:scale-105">
                        {contributor.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h5 className="text-white font-bold text-lg truncate transition-colors font-sans">
                          {contributor.name}
                        </h5>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                          {contributor.count}{" "}
                          {contributor.count === 1
                            ? "Contribution"
                            : "Contributions"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-4">
                      {renderRankBadge(index)}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Contributors;