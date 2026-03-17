import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Bookmark,
  Globe2,
  Lock,
  Search as SearchIcon,
} from "lucide-react";
import { GET_USER_FAVOURITES } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";
import DraftCard from "../../components/card/DraftCard";
import { useUserStore } from "../../store/useAuthStore";

const Favourites = () => {
  const { user } = useUserStore();
  const currentUserId = user?.id;
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
    hidden: { opacity: 0, y: 30 },
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
      <div className="w-full max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center max-w-md w-full"
        >
          <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-6">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono tracking-tight">
            Authentication Required
          </h2>
          <p className="text-gray-400 text-sm font-mono leading-relaxed mb-8 max-w-[280px]">
            Please sign in to view and manage your bookmarked manuscripts.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl transition-all duration-300 font-bold text-sm active:scale-95"
          >
            Sign In to Continue
          </Link>
        </motion.div>
      </div>
    );
  }

  const favourites = data?.getUserFavourites || [];
  const filteredFavourites = favourites.filter((script: any) =>
    script.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-2">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[90vh]"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white font-mono tracking-tight">
              Failed to load favorites
            </h2>
            <p className="text-gray-400 max-w-sm text-sm font-mono">
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
            className={`flex flex-col gap-4 ${favourites.length === 0 ? 'min-h-[80vh] justify-center' : 'min-h-[80vh]'}`}
          >
            {/* Header Section - ONLY SHOW IF THERE ARE FAVORITES TO SEARCH/VIEW */}
            {favourites.length > 0 && (
              <>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                  <h1 className="text-3xl font-extrabold text-white tracking-tight antialiased flex items-center gap-3">
                    Favorites
                  </h1>

                  <div className="w-full md:w-80">
                    <Search
                      setSearch={setSearch}
                      placeholder="Search your library..."
                    />
                  </div>
                </motion.div>

                <motion.hr
                  variants={itemVariants}
                  className="border-white/10"
                />
              </>
            )}

            {filteredFavourites.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="flex-1 flex flex-col items-center gap-4 justify-center text-center font-mono"
              >
                <div className="bg-white/5 border border-white/10 p-5 rounded-full ">
                  {search ? (
                    <SearchIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <Bookmark className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white relative z-10">
                  {search ? "No Matches Found" : "Library is Empty"}
                </h3>

                <p className="text-gray-400 max-w-md relative z-10">
                  {search
                    ? `No saved manuscripts matching "${search}". Try adjusting your search.`
                    : "You haven't bookmarked any drafts yet. Start exploring to build your collection."}
                </p>

                {!search && (
                  <Link
                    to="/explore"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 font-bold shadow-sm active:scale-95 font-sans"
                  >
                    <Globe2 className="w-4 h-4" />
                    Explore
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