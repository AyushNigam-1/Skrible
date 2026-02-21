import React from 'react';
import { useQuery } from "@apollo/client";
import { Link } from 'react-router-dom';
import {
    FileText,
    Plus,
    Tag,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Trash2
} from 'lucide-react';

import Search from '../../components/Search';
import Filters from '../../components/Filters';
import Loader from '../../components/Loader';
import Dropdown from '../../components/Dropdown'; // Keeping this imported in case you re-enable it
import { GET_USER_SCRIPTS } from '../../graphql/query/userQueries';

const Home = () => {
    // Safer parsing
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id;

    const { data, loading, error } = useQuery(GET_USER_SCRIPTS, {
        variables: { userId },
        skip: !userId,
    });

    // Mock functions for dropdown if you choose to re-enable it
    const handleInterested = (id) => console.log('Interested', id);
    const handleNotInterested = (id) => console.log('Not Interested', id);
    const handleMarkAsFavourite = (id) => console.log('Favourite', id);
    const handleDelete = (id) => console.log('Delete', id);

    const dropdownOptions = [
        { name: 'Interested', fnc: handleInterested, icon: <ThumbsUp className="w-5 h-5" /> },
        { name: 'Not Interested', fnc: handleNotInterested, icon: <ThumbsDown className="w-5 h-5" /> },
        { name: 'Mark as Favourite', fnc: handleMarkAsFavourite, icon: <Heart className="w-5 h-5" /> },
        { name: 'Delete', fnc: handleDelete, icon: <Trash2 className="w-5 h-5" /> }
    ];

    if (loading) return <Loader height="70vh" />;

    // Empty/Error State
    if (error || !data?.getUserScripts?.length) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-500 gap-4 h-[70vh] bg-gray-50 dark:bg-gray-900 transition-colors duration-300 rounded-xl">
                {/* Replace with a dark-mode compatible empty state image if you have one */}
                <img src="/no-request.png" className="w-64 mb-4 dark:opacity-80" alt="No Requests" />
                <h2 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-200">
                    No scripts available
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    Start creating your first script today.
                </p>
                <Link
                    to="/add"
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex gap-2 items-center font-bold transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Script
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        My Scripts
                    </h1>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Search />
                    <Filters />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.getUserScripts.map((script) => (
                    <div
                        key={script._id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col gap-4 h-full relative group"
                    >
                        {/* Optional Dropdown Menu (Commented out in your original code, but ready to use) */}
                        {/* <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dropdown 
                                icon={<MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />} 
                                options={dropdownOptions} 
                                scriptId={script._id} 
                            />
                        </div> */}

                        <Link
                            to={`/paragraphs/${script._id}`}
                            className="flex flex-col gap-3 w-full h-full"
                        >
                            <div className="flex flex-col gap-1 pr-6"> {/* pr-6 to leave room for dropdown icon if enabled */}
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                                    {script.title}
                                </h2>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    By {script.author.username}
                                </h4>
                            </div>

                            <p className="text-base text-gray-600 dark:text-gray-300 flex-grow line-clamp-3">
                                {script.description}
                            </p>

                            {/* Genres Tags */}
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;