import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
    CheckCircle,
    Clock,
    XCircle,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    FileText,
    Calendar
} from 'lucide-react';
import { GET_USER_CONTRIBUTIONS } from '../../graphql/query/userQueries';
import Search from '../../components/Search';
import Filters from '../../components/Filters';
import Loader from '../../components/Loader';

const MyContributions = () => {
    const [searchQuery, setSearchQuery] = useState("");

    // Safely get user ID
    const storedUser = localStorage.getItem('user');
    const userId = storedUser ? JSON.parse(storedUser).id : null;

    const { loading, error, data } = useQuery(GET_USER_CONTRIBUTIONS, {
        variables: { userId },
        skip: !userId,
    });

    if (loading) return <Loader height="70vh" />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
                    <XCircle className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Failed to load contributions</h2>
                <p className="text-gray-500">{error.message}</p>
            </div>
        );
    }

    // Safely parse the exact string date format your backend sends
    const formatFancyDate = (dateString) => {
        if (!dateString) return "Unknown Date";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    };

    // Status config for dynamic styling
    const statusConfig = {
        approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
        pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
        rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    };

    const contributions = data?.getUserContributions || [];

    // Basic frontend filter if you hook up the Search component
    const filteredContributions = contributions.filter(c =>
        c.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto pb-12">

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    My Contributions
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Search setSearch={setSearchQuery} placeholder="Search my text..." />
                    {/* <Filters /> */}
                </div>
            </div>
            <hr className="border-gray-200 dark:border-gray-800" />

            {/* --- Grid Layout --- */}
            {filteredContributions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContributions.map((contribution) => {
                        const status = contribution.status?.toLowerCase() || 'pending';
                        const StatusIcon = statusConfig[status]?.icon || Clock;
                        const statusColor = statusConfig[status]?.color || statusConfig.pending.color;

                        return (
                            <div
                                key={contribution.id}
                                className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 h-[280px]"
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatFancyDate(contribution.createdAt)}
                                    </span>
                                </div>

                                {/* Text Snippet Area */}
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-100 dark:border-gray-800/50">
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
                                        {contribution.text}
                                    </p>
                                </div>

                                {/* Card Footer: Stats & Link */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex gap-4">
                                        {/* Restored Stats from your commented code, but much cleaner! */}
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            <ThumbsUp className="w-4 h-4" /> {contribution.likes || 0}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            <ThumbsDown className="w-4 h-4" /> {contribution.dislikes || 0}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            <MessageSquare className="w-4 h-4" /> {contribution.comments?.length || 0}
                                        </div>
                                    </div>

                                    {/* Link to the Draft Document */}
                                    {contribution.script?.id && (
                                        <Link
                                            to={`/contribution/${contribution.script.id}`}
                                            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                            View Draft
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* --- Empty State --- */
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                        <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {searchQuery ? "No matches found" : "No contributions yet"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        {searchQuery
                            ? "Try tweaking your search term."
                            : "You haven't submitted any drafts yet. Head over to the Explore page to find a story to collaborate on!"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyContributions;