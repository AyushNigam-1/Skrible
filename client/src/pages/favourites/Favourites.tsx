import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Bookmark, User, Calendar, BookOpen, Globe, Lock } from 'lucide-react';
import { GET_USER_FAVOURITES } from '../../graphql/query/userQueries';
import Search from '../../components/Search';
import { useState } from 'react';

const Favourites = () => {
    // 1. Get the current logged-in user's ID
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = currentUser?.id;
    const [search, setSearch] = useState('');

    // 2. Fetch the favorites using Apollo useQuery
    const { data, loading, error } = useQuery(GET_USER_FAVOURITES, {
        variables: { userId: currentUserId },
        skip: !currentUserId, // Don't run the query if there is no user ID
        fetchPolicy: 'cache-and-network', // Ensures we get fresh data if they just bookmarked something
    });

    // Helper function to format dates nicely
    const formatDate = (timestamp: number) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", year: "numeric",
        }).format(new Date(Number(timestamp)));
    };

    // --- Authentication Check ---
    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Lock className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In Required</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Please log in to view your bookmarked drafts.</p>
            </div>
        );
    }

    // --- Loading State ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-gray-500 font-medium">Loading your favorites...</p>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Failed to load favorites</h2>
                <p className="text-gray-500 max-w-md mt-2">{error.message}</p>
            </div>
        );
    }

    const favourites = data?.getUserFavourites || [];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4">

            {/* Header section */}
            <div className="flex items-center gap-3 justify-between dark:border-gray-800 ">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Favorites</h1>
                <Search setSearch={setSearch} />
            </div>
            <hr className="border-gray-200 dark:border-gray-800" />

            {/* Empty State */}
            {favourites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No favorites yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-sm">
                        You haven't bookmarked any drafts. When you find a script you like, click the bookmark icon to save it here!
                    </p>
                    <Link to="/explore" className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                        Explore Drafts
                    </Link>
                </div>
            ) : (
                /* Grid of Favorite Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favourites.map((script) => (
                        <Link
                            key={script.id}
                            to={`/draft/${script.id}`}
                            className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
                        >
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {script.title}
                                </h3>
                                {/* Small indicator showing it's a favorite */}
                                <Bookmark className="w-5 h-5 text-yellow-500 fill-current shrink-0" />
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-5 flex-1">
                                {script.description || "No description provided."}
                            </p>

                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-300">
                                        <User className="w-4 h-4 text-gray-400" />
                                        @{script.author?.username}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(script.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        {script.languages?.[0] || 'Unknown'}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${script.visibility === 'Public' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {script.visibility}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favourites;