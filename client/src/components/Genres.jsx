import React from 'react';
import { Tag, XCircle } from 'lucide-react';

const Genres = ({ selectedGenres, onGenreChange }) => {
    // Kept the data structure, but removed the hardcoded tailwind colors 
    // as we are now using a standardized theme for light/dark mode compatibility.
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
        { name: "Young Adult" }
    ];

    const handleSelection = (genreName) => {
        const updatedGenres = selectedGenres.includes(genreName)
            ? selectedGenres.filter(g => g !== genreName)
            : [...selectedGenres, genreName];

        onGenreChange(updatedGenres);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2.5 items-center justify-start md:justify-center">
                {genres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.name);

                    return (
                        <button
                            key={genre.name}
                            onClick={() => handleSelection(genre.name)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border
                                ${isSelected
                                    ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-white/5 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            {isSelected ? (
                                <XCircle className="w-4 h-4 shrink-0" />
                            ) : (
                                <Tag className="w-4 h-4 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">{genre.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Genres;