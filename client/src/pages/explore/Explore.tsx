import { useState, useMemo } from "react";
import { AlertCircle, Globe2, SearchX, ThumbsDown, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";
import Add from "../../components/modal/AddDraft";
import { useGetScriptsByGenresQuery } from "../../graphql/generated/graphql";
import Genres from "../../components/layout/Genres";
import { Link } from "react-router-dom";

const Explore = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  const { data, loading, error, refetch } = useGetScriptsByGenresQuery({
    variables: { genres },
    fetchPolicy: "cache-and-network",
  });

  const handleGenreChange = (newGenres: string[]) => {
    setGenres(newGenres);
    refetch({ genres: newGenres });
  };

  const filteredScripts = useMemo(() => {
    return data?.getScriptsByGenres?.filter((e) =>
      e?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // --- Helper missing from inline migration ---
  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(Number(timestamp)));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "tween", ease: "easeOut", duration: 0.4 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // ── Card Container (Stagger Manager) ──
  const cardContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // ── Individual Card Variants (The specific bounce you requested) ──
  const cardItemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="w-full transition-colors font-mono duration-300 pb-12">
      <div className="max-w-7xl mx-auto space-y-4">
        <AnimatePresence mode="wait">
          {/* --- LOADING STATE --- */}
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
                Failed to Load Scripts
              </h2>
              <p className="text-gray-400 max-w-sm text-sm relative z-10 mb-6">
                {error.message}
              </p>
              <button
                onClick={() => refetch()}
                className="relative z-10 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all active:scale-95"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col gap-6 w-full"
            >
              {/* Header Section */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div className="flex items-center justify-between w-full md:w-auto">
                  <h1 className="text-3xl font-extrabold font-sans text-white tracking-tight antialiased">
                    Explore
                  </h1>
                  <div className="md:hidden shrink-0">
                    <Add />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-72">
                    <Search setSearch={setSearch} />
                  </div>
                  <div className="hidden md:block shrink-0">
                    <Add />
                  </div>
                </div>
              </motion.div>

              <motion.hr variants={itemVariants} className="border-white/10" />

              <motion.div variants={itemVariants}>
                <Genres
                  selectedGenres={genres}
                  onGenreChange={handleGenreChange}
                />
              </motion.div>

              <div className="flex-1">
                {!filteredScripts || filteredScripts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                    className="flex flex-col items-center justify-center text-center relative overflow-hidden pt-12"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="bg-white/5 border border-white/10 p-6 rounded-full mb-6 shadow-inner relative z-10">
                      <SearchX className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display'] tracking-tight relative z-10">
                      No Manuscripts Found
                    </h3>
                    <p className="text-gray-400 max-w-md text-base font-['Literata'] leading-relaxed relative z-10">
                      We couldn't find any stories matching your current search
                      or genre filters. Try adjusting them!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredScripts.map((script) => (
                        <motion.div
                          key={script!.id} // <--- Added key here!
                          layout
                          variants={cardItemVariants} // <--- Bound to cardItemVariants!
                          // Note: initial, animate, and exit are inherited from the parent automatically, 
                          // but since we are mapping, it's safer to explicitly declare them just in case.
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="group relative bg-white/5 rounded-2xl p-4 border border-white/10 font-mono hover:border-white/20 hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden"
                        >
                          <Link
                            to={`/timeline/${script.id}`}
                            className="flex flex-col h-full cursor-pointer outline-none space-y-5 relative z-10"
                          >
                            <div className="flex flex-col gap-2">
                              <h2 className="text-2xl font-extrabold text-white font-sans line-clamp-1 transition-colors tracking-tight">
                                {script.title}
                              </h2>
                              <div className="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                ~ {formatDate(script.createdAt)}
                              </div>
                            </div>
                            <p className="text-gray-300 line-clamp-4 leading-relaxed flex-grow">
                              {script.description || "No description provided for this manuscript."}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-gray-300 text-sm font-bold">
                                <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                  <ThumbsUp size={18} />
                                  <span>{script.likes?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-2 hover:text-red-300 transition-colors">
                                  <ThumbsDown size={18} />
                                  <span>{script.dislikes?.length || 0}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {script.languages && script.languages.length > 0 && (
                                  <span className="flex items-center gap-1.5 text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    <Globe2 className="w-3 h-3" />
                                    {script.languages[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Explore;