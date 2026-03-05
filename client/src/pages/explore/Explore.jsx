import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Plus, AlertCircle } from "lucide-react";
import Genres from "../../components/Genres";
import Search from "../../components/Search";
import Scripts from "../../components/card/Scripts";
import Loader from "../../components/Loader";
import Add from "../../components/modal/Add";
import { GET_SCRIPTS_BY_GENRES } from "../../graphql/query/scriptQueries";

const Explore = () => {
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_SCRIPTS_BY_GENRES, {
    variables: { genres },
  });

  const handleGenreChange = (newGenres) => {
    setGenres(newGenres);
    refetch({ genres: newGenres });
  };

  return (
    <div className="w-full transition-colors font-mono duration-300 pb-12">
      {/* Main Container to restrict ultra-wide stretching */}
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Explore
            </h1>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-72">
              <Search setSearch={setSearch} />
            </div>

            <button
              onClick={() => setOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black py-2.5 px-5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Create</span>
            </button>
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
          ) : (
            <div className="font-sans">
              <Scripts data={data} search={search} />
            </div>
          )}
        </div>
      </div>

      {/* Add Script Modal */}
      <Add open={open} setOpen={setOpen} />
    </div>
  );
};

export default Explore;
