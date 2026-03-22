import { useState, useMemo } from "react";
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
  SearchX,
  ListFilter,
  BookmarkX
} from "lucide-react";
import { GET_USER_FAVOURITES } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import Dropdown, { DropdownOption } from "../../components/layout/Dropdown";
import Loader from "../../components/layout/Loader";
import DraftCard from "../../components/card/DraftCard";
import { useUserStore } from "../../store/useAuthStore";

const FILTER_OPTIONS = [
  { id: "all", name: "All Genres" },
  { id: "fantasy", name: "Fantasy" },
  { id: "science fiction", name: "Science Fiction" },
  { id: "mystery", name: "Mystery" },
  { id: "thriller", name: "Thriller" },
  { id: "romance", name: "Romance" },
  { id: "horror", name: "Horror" },
];

const Favourites = () => {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(FILTER_OPTIONS[0]);

  const { data, loading, error } = useQuery(GET_USER_FAVOURITES, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
    fetchPolicy: "cache-and-network",
  });

  const favourites = data?.getUserFavourites || [];

  // Filter Logic
  const filteredFavourites = useMemo(() => {
    let result = favourites;

    if (searchQuery) {
      result = result.filter((script: any) =>
        script.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter.id !== "all") {
      result = result.filter((script: any) =>
        script.genres?.some((genre: string) => genre.toLowerCase() === selectedFilter.id)
      );
    }

    return result;
  }, [favourites, searchQuery, selectedFilter]);

  // --- Sleek Slide-Up Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
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
          <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">
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

  const hasAnyFavorites = favourites.length > 0;
  const isFiltering = searchQuery !== "" || selectedFilter.id !== "all";

  return (
    <div className="w-full max-w-7xl mx-auto h-full text-white pb-10">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[96vh]"
          >
            <Loader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <h2 className="text-base font-bold text-white mb-1">
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
            className="flex flex-col w-full gap-5"
          >
            {(hasAnyFavorites || isFiltering) && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-3xl font-extrabold font-sans tracking-tight">Favorites</h1>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-64">
                      <Search value={searchQuery} setSearch={setSearchQuery} placeholder="Search your library..." />
                    </div>
                    <Dropdown
                      options={FILTER_OPTIONS}
                      value={selectedFilter}
                      onChange={setSelectedFilter}
                      icon={ListFilter}
                      collapseOnMobile={true}
                      className="w-full sm:w-auto shrink-0"
                    />
                  </div>
                </div>
                <hr className="border border-white/5" />
              </>
            )}

            {!hasAnyFavorites && !isFiltering ? (
              <motion.div
                key="empty-library"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center gap-4  text-center min-h-[96vh]"
              >
                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                  <BookmarkX className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans">
                  No Bookmarks Yet
                </h3>
                <p className="text-gray-400 max-w-md text-base leading-relaxed relative z-10 font-mono">
                  You haven't bookmarked any drafts yet. Start exploring to build your collection.
                </p>
                <Link
                  to="/explore"
                  className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-bold font-sans active:scale-95"
                >
                  <Globe2 className="w-4 h-4" />
                  Explore
                </Link>
              </motion.div>
            ) : filteredFavourites.length === 0 ? (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center py-28 text-center min-h-[96vh]"
              >
                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                  <SearchX className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight font-sans">
                  No Drafts Found
                </h3>
                <p className="text-gray-400 text-sm font-mono max-w-lg mb-8 leading-relaxed px-4">
                  We couldn't find any stories matching your current search or genre filters. Try adjusting them!
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2"
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