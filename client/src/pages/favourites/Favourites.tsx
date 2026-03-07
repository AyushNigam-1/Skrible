import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Bookmark,
  BookOpen,
  Globe2,
  Lock,
} from "lucide-react";

import { GET_USER_FAVOURITES } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader"; // Adjust import path if needed
import DraftCard from "../../components/card/DraftCard";

const Favourites = () => {
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.id;
  const [search, setSearch] = useState("");

  const { data, loading, error } = useQuery(GET_USER_FAVOURITES, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
    fetchPolicy: "cache-and-network",
  });

  // --- Sleek Slide-Up Variants (Matches Explore page) ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "tween", ease: "easeOut", duration: 0.4 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // --- Authentication Check ---
  if (!currentUserId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-24 text-center px-4 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden max-w-2xl mx-auto mt-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="bg-white/5 border border-white/10 p-6 rounded-full mb-6 shadow-inner relative z-10">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display'] tracking-tight relative z-10">
          Sign In Required
        </h2>
        <p className="text-gray-400 max-w-md text-base font-['Literata'] leading-relaxed relative z-10">
          Please log in to view your bookmarked manuscripts.
        </p>
      </motion.div>
    );
  }

  const favourites = data?.getUserFavourites || [];
  const filteredFavourites = favourites.filter((script: any) =>
    script.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[90vh] gap-4"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden mt-10 max-w-2xl mx-auto"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-full mb-6 shadow-inner relative z-10">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white font-mono uppercase tracking-widest relative z-10 mb-2">
              Decryption Failed
            </h2>
            <p className="text-gray-400 max-w-sm text-sm relative z-10">
              {error.message}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 "
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-white tracking-tight antialiased flex items-center gap-3">
                  Favorites
                </h1>
              </div>
              <div className="w-full md:w-auto">
                <Search
                  setSearch={setSearch}
                  placeholder="Search your library..."
                />
              </div>
            </motion.div>
            <motion.hr
              variants={itemVariants}
              className="border-gray-200 dark:border-gray-800"
            />
            {/* --- Grid / Empty State --- */}
            {filteredFavourites.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center py-24 px-4 text-center border border-white/5 rounded-[2rem] bg-[#13151a]/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden mt-8"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="bg-white/5 border border-white/10 p-6 rounded-full mb-6 shadow-inner relative z-10">
                  <BookOpen className="w-10 h-10 text-yellow-500/80" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display'] tracking-tight relative z-10">
                  {search ? "No Matches Found" : "Library is Empty"}
                </h3>
                <p className="text-gray-400 max-w-md text-base font-['Literata'] leading-relaxed relative z-10 mb-8">
                  {search
                    ? "We couldn't find any saved manuscripts matching that title."
                    : "You haven't bookmarked any drafts yet. When you find a story you love, click the bookmark icon to save it here!"}
                </p>
                {!search && (
                  <Link
                    to="/explore"
                    className="group relative z-10 flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 font-mono font-bold shadow-lg shadow-blue-900/40 active:scale-95"
                  >
                    <Globe2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Explore Library
                  </Link>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredFavourites.map((script: any) => (
                    <motion.div
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      key={script.id}
                      className="h-full"
                    >
                      {/* Using the standard DraftCard instead of custom styling */}
                      <DraftCard script={script} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favourites;
