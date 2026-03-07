import { useState, useMemo } from "react";
import { AlertCircle, SearchX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Search from "../../components/layout/Search";
import Loader from "../../components/layout/Loader";
import Add from "../../components/modal/AddDraft";
import { useGetScriptsByGenresQuery } from "../../graphql/generated/graphql";
import DraftCard from "../../components/card/DraftCard";
import Genres from "../../components/layout/Genres";

const Explore = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  // The generated hook is fully typed! No need to pass manual generics.
  const { data, loading, error, refetch } = useGetScriptsByGenresQuery({
    variables: { genres },
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <div className="w-full transition-colors font-mono duration-300">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
        </div>

        <hr className="border-white/10" />

        {/* Filters Section */}
        <div className="py-2">
          <Genres selectedGenres={genres} onGenreChange={handleGenreChange} />
        </div>

        {/* Content Area */}
        <div className="flex-1 mt-2">
          {error ? (
            <div className="flex items-start gap-4 p-5 bg-red-900/20 text-red-400 rounded-2xl border border-red-800/30 shadow-sm">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
              <div>
                <h3 className="font-bold text-lg mb-1 font-sans">
                  Failed to load scripts
                </h3>
                <p className="text-sm opacity-90 font-mono leading-relaxed">
                  {error.message}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 text-sm font-bold underline hover:no-underline font-sans"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader />
            </div>
          ) : !filteredScripts || filteredScripts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center p-8 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl font-['Inter'] relative overflow-hidden mt-8"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="bg-white/5 border border-white/10 p-6 rounded-full mb-6 shadow-inner relative z-10">
                <SearchX className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display'] tracking-tight relative z-10">
                No Manuscripts Found
              </h3>
              <p className="text-gray-400 max-w-md text-base font-['Literata'] leading-relaxed relative z-10">
                We couldn't find any stories matching your current search or
                genre filters. Try adjusting them!
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"
            >
              <AnimatePresence mode="popLayout">
                {filteredScripts.map((script) => (
                  // We know script won't be null here because of the filter
                  <DraftCard key={script!.id} script={script!} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
