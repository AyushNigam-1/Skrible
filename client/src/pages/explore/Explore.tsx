import { useState, useMemo } from "react";
import { AlertCircle, SearchX } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";
import Add from "../../components/modal/AddDraft";
import { useGetScriptsByGenresQuery } from "../../graphql/generated/graphql";
import DraftCard from "../../components/card/DraftCard";
import Genres from "../../components/layout/Genres";

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
      e?.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  // --- Smooth Slide-Up Variants ---
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
              className="flex flex-col gap-4 w-full"
            >
              {/* Header Section */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold font-sans text-white tracking-tight antialiased">
                    Explore
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-72">
                    <Search setSearch={setSearch} />
                  </div>
                  <Add />
                </div>
              </motion.div>

              <motion.hr variants={itemVariants} className="border-white/10" />

              {/* Filters Section */}
              <motion.div variants={itemVariants} className="py-2">
                <Genres
                  selectedGenres={genres}
                  onGenreChange={handleGenreChange}
                />
              </motion.div>

              {/* Content Area (Grid or Empty State) */}
              <div className="flex-1 mt-2">
                {!filteredScripts || filteredScripts.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center text-center p-12 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl font-['Inter'] relative overflow-hidden mt-4"
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
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredScripts.map((script) => (
                        <motion.div
                          layout
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          key={script!.id}
                          className="h-full"
                        >
                          {/* We know script won't be null here because of the filter */}
                          <DraftCard script={script!} />
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
