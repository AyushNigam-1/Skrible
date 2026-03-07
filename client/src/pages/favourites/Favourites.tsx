import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Bookmark,
  Calendar,
  BookOpen,
  Globe2,
  Lock,
} from "lucide-react";
import { GET_USER_FAVOURITES } from "../../graphql/query/userQueries";
import Search from "../../components/layout/Search";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(Number(timestamp)));
  };

  // --- Sleek Slide-Up Variants (Matches Explore page) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "tween", ease: "easeOut", duration: 0.4 },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // --- Authentication Check ---
  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
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
      </div>
    );
  }

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-gray-400 font-mono uppercase tracking-widest text-sm font-bold">
          Retrieving Favorites...
        </p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-full mb-6 shadow-inner relative z-10">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-widest relative z-10 mb-2">
          Decryption Failed
        </h2>
        <p className="text-gray-400 max-w-sm text-sm relative z-10">
          {error.message}
        </p>
      </div>
    );
  }

  const favourites = data?.getUserFavourites || [];
  const filteredFavourites = favourites.filter((script) =>
    script.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-['Inter'] animate-in fade-in duration-500 pb-12">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight antialiased flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-yellow-500 fill-current" />
            My Favorites
          </h1>
          <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">
            Your Curated Library
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Search setSearch={setSearch} placeholder="Search your library..." />
        </div>
      </div>

      {/* --- Empty State --- */}
      {filteredFavourites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-24 px-4 text-center border border-white/5 rounded-[2rem] bg-[#13151a]/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
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
        /* --- Grid of Favorite Cards --- */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredFavourites.map((script) => (
              <motion.div
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                key={script.id}
                className="group relative bg-[#13151a]/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/5 hover:border-white/20 hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-[300px] overflow-hidden"
              >
                {/* Premium Bookmark Ribbon */}
                <div className="absolute top-0 right-6 w-8 h-10 bg-yellow-500/20 border-b border-l border-r border-yellow-500/30 flex justify-center backdrop-blur-md rounded-b-md shadow-[0_5px_15px_rgba(234,179,8,0.2)]">
                  <Bookmark className="w-4 h-4 text-yellow-400 fill-current mt-2" />
                </div>

                <Link
                  to={`/timeline/${script.id}`}
                  className="flex flex-col h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 rounded-xl relative z-10 pt-2"
                >
                  {/* --- Top Metadata (Author & Date) --- */}
                  <div className="flex justify-between items-center mb-4 pr-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold shadow-inner">
                        {script.author?.username?.charAt(0).toUpperCase() ||
                          "?"}
                      </div>
                      <span className="text-gray-300 text-sm font-semibold tracking-wide">
                        @{script.author?.username}
                      </span>
                    </div>
                  </div>

                  {/* --- Title & Description --- */}
                  <div className="flex flex-col gap-2 mb-3 pr-2">
                    <h2 className="text-2xl font-bold text-white line-clamp-1 font-['Playfair_Display'] group-hover:text-yellow-100 transition-colors tracking-tight">
                      {script.title}
                    </h2>
                  </div>

                  <p className="text-gray-400 text-[15px] font-['Literata'] line-clamp-3 leading-relaxed flex-grow">
                    {script.description ||
                      "No description provided for this manuscript."}
                  </p>

                  {/* --- Footer Metadata --- */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      {formatDate(script.createdAt)}
                    </div>

                    <div className="flex items-center gap-2">
                      {script.languages?.length > 0 && (
                        <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Globe2 className="w-3 h-3" />
                          {script.languages[0]}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm ${
                          script.visibility === "Public"
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border border-red-500/30 text-red-400"
                        }`}
                      >
                        {script.visibility}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Favourites;
