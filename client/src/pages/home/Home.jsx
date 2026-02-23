import React, { useState } from 'react';
import { useQuery } from "@apollo/client";
import { Link } from 'react-router-dom';
import { FileText, Plus, AlertCircle, SearchX } from 'lucide-react';

import Search from '../../components/Search';
import Scripts from '../../components/Scripts'; // Bringing in your premium grid component
import Loader from '../../components/Loader';
import { GET_USER_SCRIPTS } from '../../graphql/query/userQueries';

const Home = () => {
    // State to handle searching through your own scripts
    const [search, setSearch] = useState('');

    // Safely parse the user from localStorage
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id;

    const { data, loading, error } = useQuery(GET_USER_SCRIPTS, {
        variables: { userId },
        skip: !userId,
    });

    return (
        <div className="w-full  transition-colors duration-300">

            {/* Main Container */}
            <div className="max-w-7xl space-y-4 mx-auto">

                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            My Drafts
                        </h1>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-72">
                            <Search setSearch={setSearch} placeholder="Search my drafts..." />
                        </div>
                        <Link
                            to="/add"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create</span>
                        </Link>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* --- Content Area --- */}
                <div className="flex-1 mt-4">
                    {error ? (
                        <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/30 shadow-sm">
                            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Failed to load your drafts</h3>
                                <p className="text-sm opacity-90">{error.message}</p>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <Loader />
                        </div>
                    ) : data?.getUserScripts?.length === 0 ? (

                        /* --- Beautiful Empty State --- */
                        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl shadow-sm">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full mb-5">
                                <SearchX className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No drafts available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                                You haven't created any stories or drafts yet. Click the button below to start your creative journey.
                            </p>
                            <Link
                                to="/add"
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Start Creating
                            </Link>
                        </div>
                    ) : (

                        /* --- Scripts Grid Component --- */
                        /* Note: We wrap the array in an object that perfectly matches 
                            what the <Scripts /> component expects to receive from the Explore page.
                        */
                        <Scripts
                            data={{ getScriptsByGenres: data.getUserScripts }}
                            search={search}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;