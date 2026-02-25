import { useMutation } from "@apollo/client";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
    ThumbsUp,
    ThumbsDown,
    Heart,
    Trash2,
    MoreVertical,
    Tag,
    SearchX,
    User
} from 'lucide-react';

import Dropdown from './Dropdown';
import useElementHeight from '../hooks/useElementOffset';
import {
    DELETE_SCRIPT,
    // MARK_AS_FAVOURITE,
    // MARK_AS_INTERESTED,
    // MARK_AS_NOT_INTERESTED
} from '../graphql/mutation/scriptMutations';

const Scripts = ({ data, search }) => {
    const height = useElementHeight("not_found");
    const user = Cookies.get('jwt');

    // NOTE: Uncommented these hooks so your dropdownOptions don't throw an "undefined" crash
    // const [markAsInterested] = useMutation(MARK_AS_INTERESTED);
    // const [markAsNotInterested] = useMutation(MARK_AS_NOT_INTERESTED);
    // const [markAsFavourite] = useMutation(MARK_AS_FAVOURITE);
    const [deleteScript] = useMutation(DELETE_SCRIPT);

    const handleAction = async (actionFn, id, successMessage) => {
        try {
            if (!actionFn) return console.warn("Mutation function is not defined");
            await actionFn({ variables: { scriptId: id } });
            console.log(successMessage);
            // Optionally add a toast notification here
        } catch (error) {
            console.error(`Error ${successMessage.toLowerCase()}:`, error);
        }
    };

    const dropdownOptions = [
        {
            name: 'Interested',
            fnc: (id) => handleAction(markAsInterested, id, "Marked as Interested!"),
            icon: <ThumbsUp className="w-4 h-4" />
        },
        {
            name: 'Not Interested',
            fnc: (id) => handleAction(markAsNotInterested, id, "Marked as Not Interested!"),
            icon: <ThumbsDown className="w-4 h-4" />
        },
        {
            name: 'Favourite',
            fnc: (id) => handleAction(markAsFavourite, id, "Marked as Favourite!"),
            icon: <Heart className="w-4 h-4 text-pink-500" />
        },
        {
            name: 'Delete',
            fnc: (id) => handleAction(deleteScript, id, "Script Deleted!"),
            icon: <Trash2 className="w-4 h-4" />,
            isDanger: true
        }
    ];

    const filtered = data?.getScriptsByGenres?.filter((e) =>
        e.title.toLowerCase().includes(search?.toLowerCase() || '')
    );

    if (!filtered || filtered.length === 0) {
        return (
            <div
                id="not_found"
                style={{ minHeight: height || '50vh' }}
                className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
                <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-full mb-5 shadow-inner">
                    <SearchX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                {/* APPLIED PLAYFAIR DISPLAY */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-['Playfair_Display']">
                    No Scripts Found
                </h3>
                {/* APPLIED CRIMSON PRO */}
                <p className="text-gray-500 dark:text-gray-400 max-w-md font-['Crimson_Pro'] text-lg">
                    We couldn't find any scripts matching your current search or genre filters. Try adjusting them!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((script) => (
                <div
                    key={script.id}
                    className="group relative bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm     hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col h-[280px]"
                >
                    <Link
                        to={`/timeline/${script.id}`}
                        className="flex flex-col h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                    >
                        {/* Header Area */}
                        <div className="flex flex-col gap-1 pr-8 mb-3">
                            {/* APPLIED PLAYFAIR DISPLAY */}
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-['Playfair_Display'] tracking-wide">
                                {script.title}
                            </h2>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <User className="w-3.5 h-3.5" />
                                <span className="truncate">{script.author.username}</span>
                            </div>
                        </div>

                        {/* Description - APPLIED CRIMSON PRO */}
                        <p className="text-base text-gray-600 dark:text-gray-300 flex-grow line-clamp-4 leading-relaxed font-['Crimson_Pro']">
                            {script.description || "No description provided."}
                        </p>

                        {/* Tags / Footer */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/80">
                            {script.genres.slice(0, 3).map((genre) => (
                                <span
                                    key={genre}
                                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide"
                                >
                                    <Tag className="w-3 h-3" />
                                    {genre}
                                </span>
                            ))}
                            {script.genres.length > 3 && (
                                <span className="flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800">
                                    +{script.genres.length - 3}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Dropdown Options */}
                    {user && (
                        <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                                icon={
                                    <button className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors backdrop-blur-sm">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                }
                                options={dropdownOptions}
                                scriptId={script.id}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Scripts;