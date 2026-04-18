import { useState, useMemo } from "react";
import { AlertCircle, SearchX, FileExclamationPoint, Loader2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Search from "../../components/layout/Search";
import Add from "../../components/modal/AddDraft";
import { useGetScriptsByGenresQuery } from "../../graphql/generated/graphql";
import Genres from "../../components/layout/Genres";
import DraftCard from "../../components/card/DraftCard";

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

  const rawScripts = data?.getScriptsByGenres || [];

  const filteredScripts = useMemo(() => {
    return rawScripts.filter((e) =>
      e?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [rawScripts, search]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "tween", ease: "easeOut", duration: 0.4 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const isFiltering = search !== "" || genres.length > 0;
  const hasAnyScripts = rawScripts.length > 0;

  return (
    <div className="w-full transition-colors font-mono duration-300">
      <div className="max-w-7xl mx-auto space-y-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full min-h-[96dvh]"
            >
              <Loader2 className="size-8 shrink-0 animate-spin" />

            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center px-4 sm:px-6 text-center min-h-[96dvh] space-y-4 sm:space-y-5 relative overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 p-3 sm:p-4 rounded-full shadow-sm relative z-10">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans relative z-10">
                Failed to load drafts
              </h3>
              <p className="text-sm sm:text-base text-gray-400 max-w-xs sm:max-w-md relative z-10 leading-relaxed">
                We couldn't load this data right now. Please check your connection and try again.
              </p>
              <div className="relative z-10 pt-2">
                <button
                  onClick={() => refetch()}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-4 w-full"
            >
              {(hasAnyScripts || isFiltering) && (
                <>
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
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
                        <Search value={search} setSearch={setSearch} />
                      </div>
                      <div className="hidden md:block shrink-0">
                        <Add />
                      </div>
                    </div>
                  </motion.div>

                  <motion.hr
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="border-white/10"
                  />

                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Genres
                      selectedGenres={genres}
                      onGenreChange={handleGenreChange}
                    />
                  </motion.div>
                </>
              )}
              <div className="flex-1">
                {!hasAnyScripts && !isFiltering ? (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4 items-center justify-center text-center relative overflow-hidden min-h-[96dvh]"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                      <FileExclamationPoint className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans relative z-10">
                      No Drafts Yet
                    </h3>
                    <p className="text-gray-400 max-w-md text-base leading-relaxed relative z-10 font-mono">
                      There are currently no drafts published on the platform. Be the first to start a story!
                    </p>
                    <div className="relative z-10">
                      <Add />
                    </div>
                  </motion.div>
                ) : !filteredScripts || filteredScripts.length === 0 ? (
                  <motion.div
                    key="no-search-results"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col gap-4 items-center justify-center py-24 text-center min-h-[70vh]"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                      <SearchX className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans">
                      No Results Found
                    </h3>
                    <p className="text-gray-400 max-w-md text-base leading-relaxed relative z-10 font-mono">
                      We couldn't find any result matching your current search filters. Try adjusting them!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredScripts.map((script) => (
                        <motion.div
                          key={script!.id}
                          layout
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="h-full"
                        >
                          <DraftCard script={script! as any} />
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