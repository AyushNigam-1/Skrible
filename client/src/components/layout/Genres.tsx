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
  ];

  // 2. Add type to the event handler parameter
  const handleSelection = (genreName: string) => {
    const updatedGenres = selectedGenres.includes(genreName)
      ? selectedGenres.filter((g) => g !== genreName)
      : [...selectedGenres, genreName];

    onGenreChange(updatedGenres);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 relative">
      {/* - overflow-x-auto enables horizontal scrolling
          - snap-x snap-mandatory makes the scrolling feel smooth like an app
          - [&::-webkit-scrollbar]:hidden hides the scrollbar on Chrome/Safari
          - [scrollbar-width:none] hides it on Firefox
      */}
      <div className="flex overflow-x-auto gap-3  [&::-webkit-scrollbar]:hidden [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.name);

          return (
            <button
              key={genre.name}
              onClick={() => handleSelection(genre.name)}
              className={`
                group shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-all duration-300 active:scale-95 backdrop-blur-md
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

      {/* Optional: Subtle gradient fades on the edges to indicate more content is scrollable on mobile */}
      {/*<div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-[#0A0A14] to-transparent pointer-events-none md:hidden" />
      <div className="absolute top-0 left-0 bottom-2 w-8 bg-gradient-to-r from-[#0A0A14] to-transparent pointer-events-none md:hidden" />*/}
    </div>
  );
};

export default Genres;
