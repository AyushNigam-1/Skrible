import { Tag, XCircle } from "lucide-react";

const Genres = ({ selectedGenres, onGenreChange }) => {
  const genres = [
    { name: "Fantasy" },
    { name: "Science Fiction" },
    { name: "Mystery" },
    { name: "Thriller" },
    { name: "Romance" },
    { name: "Horror" },
    { name: "Non-fiction" },
    { name: "Biography" },
    { name: "Self-help" },
    // { name: "Young Adult" },
  ];

  const handleSelection = (genreName) => {
    const updatedGenres = selectedGenres.includes(genreName)
      ? selectedGenres.filter((g) => g !== genreName)
      : [...selectedGenres, genreName];

    onGenreChange(updatedGenres);
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-3 items-center justify-start md:justify-center">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.name);

          return (
            <button
              key={genre.name}
              onClick={() => handleSelection(genre.name)}
              className={`
                                group flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm font-semibold transition-all duration-300 active:scale-95 backdrop-blur-md
                                ${
                                  isSelected
                                    ? "bg-blue-500/10 border border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5"
                                }
                            `}
            >
              {isSelected ? (
                <XCircle className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
              ) : (
                <Tag className="w-4 h-4 shrink-0 text-gray-500 group-hover:text-blue-400 transition-colors" />
              )}
              <span className="whitespace-nowrap tracking-tight">
                {genre.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Genres;
