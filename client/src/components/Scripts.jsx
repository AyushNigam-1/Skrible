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
    SearchX
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

    // const [markAsInterested] = useMutation(MARK_AS_INTERESTED);
    // const [markAsNotInterested] = useMutation(MARK_AS_NOT_INTERESTED);
    // const [markAsFavourite] = useMutation(MARK_AS_FAVOURITE);
    const [deleteScript] = useMutation(DELETE_SCRIPT);

    const handleAction = async (actionFn, id, successMessage) => {
        try {
            await actionFn({ variables: { scriptId: id } });
            console.log(successMessage);
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
            icon: <Heart className="w-4 h-4" />
        },
        {
            name: 'Delete',
            fnc: (id) => handleAction(deleteScript, id, "Script Deleted!"),
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
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
                className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
            >
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <SearchX className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    No Match Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    We couldn't find any scripts matching your search criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((script) => (
                <div
                    key={script.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-all flex gap-4 h-full relative group"
                >
                    <Link
                        to={`/paragraphs/${script.id}`}
                        className="flex flex-col gap-3 w-full justify-between"
                    >
                        <div className="flex flex-col gap-1 pr-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                                {script.title}
                            </h2>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                By {script.author.username}
                            </h4>
                        </div>

                        <p className="text-base text-gray-600 dark:text-gray-300 flex-grow line-clamp-3">
                            {script.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                            {script.genres.map((genre) => (
                                <span
                                    key={genre}
                                    className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-semibold"
                                >
                                    <Tag className="w-3 h-3" />
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </Link>

                    {user && (
                        <div className="absolute top-4 right-4">
                            <Dropdown
                                icon={
                                    <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
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
