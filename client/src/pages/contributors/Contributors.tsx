import React, { useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Users, Trophy, Medal, Filter } from "lucide-react";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";
import Dropdown, { DropdownOption } from "../../components/layout/Dropdown";

// --- Types ---
interface Paragraph {
  author?: {
    id: string;
    name: string;
  };
}

interface ScriptContext {
  data: {
    getScriptById?: {
      paragraphs: Paragraph[];
    };
  };
  loading: boolean;
}

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
  const { id: draftId } = useParams<{ id: string }>();

  const { data, loading } = useOutletContext<ScriptContext>();
  const paragraphs = data?.getScriptById?.paragraphs || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(
    filterOptions[0],
  );

  // useMemo efficiently groups, counts, SORTS, and FILTERS the contributors
  const contributorsLeaderboard = useMemo(() => {
    const grouped: Record<string, Contributor> = {};

    // 1. Group and Count
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
      <div className="flex items-center justify-center w-full min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6 w-full mx-auto font-mono"
    >
      {paragraphs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-4 relative overflow-hidden"
        >
          <div className="bg-white/5 border border-white/20 p-4 rounded-full shadow-sm relative z-10">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-3 tracking-tight font-sans relative z-10">
            No contributors yet
          </h3>
          <p className="text-gray-400 max-w-md relative z-10">
            This draft doesn't have any approved contributions right now.
          </p>
        </motion.div>
      )}

      {paragraphs.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between gap-3 relative z-20 w-full"
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
            icon={Filter}
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
                    to={`/contributions/${draftId}/${contributor.id}`}
                    className="group flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-white/5 hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg font-bold shadow-inner shrink-0 transition-transform group-hover:scale-105">
                        {contributor.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h5 className="text-white font-bold text-lg truncate transition-colors font-sans">
                          @{contributor.name}
                        </h5>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
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
            /* --- Search Empty State --- */
            <motion.div
              key="search-empty"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 relative overflow-hidden"
            >
              <div className="bg-white/10 border border-white/20 p-4 rounded-full shadow-sm relative z-10">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white relative z-10 font-sans">
                No matching contributors
              </h3>
              <p className="text-gray-400 max-w-md relative z-10 text-sm">
                Try adjusting your search term to find who you're looking for.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Contributors;