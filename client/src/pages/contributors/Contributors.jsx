import React, { useState, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { User, Users, Trophy, Medal } from 'lucide-react';
import Search from '../../components/Search';
import Filters from '../../components/Filters';

const Contributors = () => {
    const { data } = useOutletContext();
    const [searchQuery, setSearchQuery] = useState("");

    const paragraphs = data?.getScriptById?.paragraphs || [];

    // useMemo efficiently groups, counts, and SORTS the contributors into a true leaderboard
    const contributorsLeaderboard = useMemo(() => {
        const grouped = {};

        paragraphs.forEach(item => {
            const username = item.author?.username;
            if (!username) return;

            if (!grouped[username]) {
                grouped[username] = {
                    username: username,
                    count: 0,
                };
            }
            grouped[username].count += 1;
        });

        // Convert object to array and sort descending by contribution count
        return Object.values(grouped).sort((a, b) => b.count - a.count);
    }, [paragraphs]);

    // Apply the search filter dynamically
    const filteredContributors = contributorsLeaderboard.filter(c =>
        c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to render special icons/colors for the Top 3
    const renderRankBadge = (index) => {
        if (index === 0) return <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-500 rounded-full shadow-sm"><Trophy className="w-5 h-5" /></div>;
        if (index === 1) return <div className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full shadow-sm"><Medal className="w-5 h-5" /></div>;
        if (index === 2) return <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-full shadow-sm"><Medal className="w-5 h-5" /></div>;

        return (
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                #{index + 1}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full mx-auto">
            {/* --- Header Controls --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="w-full sm:w-72">
                    <Search setSearch={setSearchQuery} placeholder="Search contributors..." />
                </div>
                <div className="w-full sm:w-auto">
                    <Filters />
                </div>
            </div>

            {/* --- Content Area --- */}
            {filteredContributors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredContributors.map((contributor, index) => (
                        <Link
                            key={contributor.username}
                            to={`/profile/${contributor.username}`}
                            className="group flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                {/* Dynamic Avatar */}
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-inner shrink-0">
                                    {contributor.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex flex-col overflow-hidden">
                                    <h5 className="text-gray-900 dark:text-white font-bold text-lg truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {contributor.username}
                                    </h5>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {contributor.count} {contributor.count === 1 ? 'Contribution' : 'Contributions'}
                                    </p>
                                </div>
                            </div>

                            {/* Rank Badge */}
                            <div className="shrink-0 ml-2">
                                {renderRankBadge(index)}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* --- Empty State --- */
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                        <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {searchQuery ? "No contributors found" : "No contributors yet"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        {searchQuery
                            ? "Try adjusting your search to find who you're looking for."
                            : "This draft doesn't have any approved contributions yet."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Contributors;