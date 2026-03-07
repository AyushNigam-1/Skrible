import { Tag, XCircle } from "lucide-react";

// 1. Define the props interface
interface GenresProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
}

const Genres = ({ selectedGenres, onGenreChange }: GenresProps) => {
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

  // 2. Add type to the event handler parameter
  const handleSelection = (genreName: string) => {
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
                group flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-all duration-300 active:scale-95 backdrop-blur-md
                ${
                  isSelected
                    ? "bg-white/10 border border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5"
                }
              `}
            >
              {isSelected ? (
                <XCircle className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90 text-white" />
              ) : (
                <Tag className="w-4 h-4 shrink-0 text-gray-500 group-hover:text-white transition-colors" />
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
