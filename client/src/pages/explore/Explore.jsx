import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Plus, Compass, AlertCircle } from 'lucide-react';
import Genres from '../../components/Genres';
import Search from '../../components/Search';
import Scripts from '../../components/Scripts';
import Loader from '../../components/Loader';
import Add from '../add/Add';
import { GET_SCRIPTS_BY_GENRES } from '../../graphql/query/scriptQueries';

const Explore = () => {
    const [genres, setGenres] = useState([]);
    const [search, setSearch] = useState(''); // Initialized with empty string for controlled inputs
    const [open, setOpen] = useState(false);

    const { data, loading, error, refetch } = useQuery(GET_SCRIPTS_BY_GENRES, {
        variables: { genres }
    });

    const handleGenreChange = (newGenres) => {
        setGenres(newGenres);
        refetch({ genres: newGenres });
    };

    return (
        <div className="space-y-4 w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                {/* Title */}
                <div className="flex items-center gap-3">
                    {/* <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Compass className="size-5 text-blue-600 dark:text-blue-400" />
                    </div> */}
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Explore
                    </h1>
                </div>

                {/* Action Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Search setSearch={setSearch} />

                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-5 rounded-lg font-medium shadow-sm transition-all duration-200 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create</span>
                    </button>
                </div>
            </div>
            <hr className='border-gray-200 dark:border-gray-700 ' />

            {/* Filters Section */}
            {/* <div className="bg transition-colors duration-300"> */}
            <Genres selectedGenres={genres} onGenreChange={handleGenreChange} />
            {/* </div> */}

            {/* Content Area */}
            <div className="flex-1">
                {error ? (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-lg">Failed to load scripts</h3>
                            <p className="text-sm opacity-90">{error.message}</p>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <Loader />
                    </div>
                ) : (
                    <Scripts data={data} search={search} />
                )}
            </div>

            {/* Add Script Modal */}
            <Add open={open} setOpen={setOpen} />
        </div>
    );
};

export default Explore; 