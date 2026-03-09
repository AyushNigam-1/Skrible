import React, { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Users, Trophy, Medal, Filter, ChevronDown, Check } from "lucide-react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";

import Search from "../../components/layout/Search"; // Adjust path if needed
import Loader from "../../components/layout/Loader"; // Adjust path if needed

// --- Types ---
interface Paragraph {
  author?: {
    id: string; // <-- ADDED ID HERE
    username: string;
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
  id: string; // <-- ADDED ID HERE
  username: string;
  count: number;
}

const filterOptions = [
  { id: 1, name: "Highest First" },
  { id: 2, name: "Lowest First" },
  { id: 3, name: "A-Z" },
];

const Contributors: React.FC = () => {
  const { data, loading } = useOutletContext<ScriptContext>();
  const paragraphs = data?.getScriptById?.paragraphs || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  // useMemo efficiently groups, counts, SORTS, and FILTERS the contributors
  const contributorsLeaderboard = useMemo(() => {
    const grouped: Record<string, Contributor> = {};

    // 1. Group and Count
    paragraphs.forEach((item) => {
      const username = item.author?.username;
      const id = item.author?.id; // <-- EXTRACT ID HERE

      // Ensure we have both to prevent grouping errors
      if (!username || !id) return;

      if (!grouped[username]) {
        // <-- SAVE ID INTO THE GROUPED OBJECT
        grouped[username] = { id, username, count: 0 };
      }
      grouped[username].count += 1;
    });

    let result = Object.values(grouped);

    // 2. Search Filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.username.toLowerCase().includes(lowerQuery),
      );
    }

    // 3. Sort based on selected filter
    result.sort((a, b) => {
      if (selectedFilter.name === "Highest First") return b.count - a.count;
      if (selectedFilter.name === "Lowest First") return a.count - b.count;
      if (selectedFilter.name === "A-Z")
        return a.username.localeCompare(b.username);
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
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Helper to render special icons/colors for the Top 3
  const renderRankBadge = (index: number) => {
    // Only apply the top 3 styling if we are sorting by highest first
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

  return (
    <div className="flex flex-col gap-6 w-full mx-auto font-mono">
      {/* --- Header: Search & Filter --- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20"
      >
        <div className="w-full sm:w-72">
          <Search setSearch={setSearchQuery} placeholder="Search users..." />
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

      {/* --- Content Area --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full min-h-[50vh]"
          >
            <Loader />
          </motion.div>
        ) : contributorsLeaderboard.length > 0 ? (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* WRAPPED IN THE MOTION DIV FOR THE STAGGER ANIMATION */}
            {contributorsLeaderboard.map((contributor, index) => (
              <motion.div variants={itemVariants} key={contributor.username}>
                <Link
                  to={`/profile/${contributor.id}`}
                  className="group flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-white/5 hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Dynamic Avatar */}
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg font-bold shadow-inner shrink-0 transition-transform group-hover:scale-105">
                      {contributor.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h5 className="text-white font-bold text-lg truncate transition-colors">
                        @{contributor.username}
                      </h5>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                        {contributor.count}{" "}
                        {contributor.count === 1
                          ? "Contribution"
                          : "Contributions"}
                      </p>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="shrink-0 ml-4">{renderRankBadge(index)}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* --- Empty State --- */
          <motion.div
            key="empty"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-[#130f1c]/50 backdrop-blur-xl shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="bg-white/10 border border-white/20 p-4 rounded-full mb-5 shadow-sm relative z-10">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10 font-sans tracking-tight">
              {searchQuery ? "No matching contributors" : "No contributors yet"}
            </h3>
            <p className="text-gray-400 max-w-md text-sm relative z-10 leading-relaxed font-sans">
              {searchQuery
                ? "Try adjusting your search term."
                : "This draft doesn't have any approved contributions yet. Check back later or be the first to contribute!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contributors;
