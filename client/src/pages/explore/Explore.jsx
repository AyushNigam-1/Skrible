import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Plus, Compass, AlertCircle } from 'lucide-react';
import Genres from '../../components/Genres';
import Search from '../../components/Search';
import Scripts from '../../components/Scripts';
import Loader from '../../components/Loader';
import Add from '../../components/Add';
import { GET_SCRIPTS_BY_GENRES } from '../../graphql/query/scriptQueries';

const Explore = () => {
    const [genres, setGenres] = useState([]);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);

    const { data, loading, error, refetch } = useQuery(GET_SCRIPTS_BY_GENRES, {
        variables: { genres }
    });

    const handleGenreChange = (newGenres) => {
        setGenres(newGenres);
        refetch({ genres: newGenres });
    };

    return (
        <div className="w-full transition-colors duration-300 pb-12">
            {/* Main Container to restrict ultra-wide stretching */}
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        {/* <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
                            <Compass className="w-6 h-6" />
                        </div> */}
                        {/* APPLIED INTER TO MAIN HEADING FOR CRISP UI ALIGNMENT */}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-['Inter']">
                            Explore
                        </h1>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-72">
                            <Search setSearch={setSearch} />
                        </div>
                        {/* APPLIED INTER TO CREATE BUTTON */}
                        <button
                            onClick={() => setOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shrink-0 font-['Inter'] tracking-wide"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create</span>
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Filters Section */}
                <div className="py-2">
                    <Genres selectedGenres={genres} onGenreChange={handleGenreChange} />
                </div>

                {/* Content Area */}
                <div className="flex-1 mt-2">
                    {error ? (
                        <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/30 shadow-sm">
                            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
                            <div>
                                {/* APPLIED INTER TO ERROR HEADING */}
                                <h3 className="font-bold text-lg mb-1 font-['Inter']">Failed to load scripts</h3>
                                {/* APPLIED LITERATA TO ERROR DESCRIPTION FOR READABILITY */}
                                <p className="text-lg opacity-90 font-['Literata'] leading-relaxed">{error.message}</p>
                                <button
                                    onClick={() => refetch()}
                                    className="mt-3 text-sm font-bold underline hover:no-underline font-['Inter']"
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
                        /* APPLIED LITERATA WRAPPER SO CARDS INHERIT THE HIGHLY LEGIBLE FONT */
                        <div className="font-['Literata']">
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