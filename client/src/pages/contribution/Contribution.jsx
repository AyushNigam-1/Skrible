import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Send, MessageSquare, User, AlertCircle, Loader2 } from 'lucide-react';
import useElementHeight from '../../hooks/useElementOffset';
import { GET_PARAGRAPH_BY_ID } from '../../graphql/query/paragraphQueries';

// Make sure to import your query from wherever it is stored

const ContributionDetail = () => {
    // 1. Grab the ID directly from the URL (e.g., /para/:id)
    const { id } = useParams();
    const navigate = useNavigate();
    const commentsHeight = useElementHeight('comments-container');

    // 2. Fetch the data dynamically based on the URL ID
    const { data, loading, error } = useQuery(GET_PARAGRAPH_BY_ID, {
        variables: { paragraphId: id },
        skip: !id, // Don't run the query if there's no ID
    });
    console.log("data", data)
    // 3. Helper to format dates for both the contribution and the comments
    const formatFancyDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(Number(timestamp));
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // --- Loading & Error States ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading contribution...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[60vh] gap-3 text-center px-4 py-2">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Failed to load</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">{error.message}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const contribution = data?.getParagraphById;

    // Safety fallback if ID doesn't exist in the database
    if (!contribution) {
        return <Navigate to="/explore" replace />;
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto ">

            {/* --- Header & Navigation --- */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contribution Details</h2>
                </div>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${contribution.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    contribution.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {contribution.status}
                </span>
            </div>

            {/* --- Contribution Content Card --- */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-5 shrink-0">

                {/* Author Info */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {contribution.author?.username?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                            {contribution.author?.username}
                        </p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Submitted {formatFancyDate(contribution.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Markdown Text Area */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 md:p-6 border border-gray-100 dark:border-gray-800">
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                ul: ({ children }) => <ul className="list-disc ml-5 mb-4">{children}</ul>,
                                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>
                            }}
                        >
                            {contribution.text}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>

            {/* --- Comments Section --- */}
            <div
                id="comments-container"
                className="flex flex-col bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
                style={{ height: commentsHeight || '50vh' }}
            >
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 shrink-0 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Discussion</h3>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold ml-2">
                        {contribution.comments?.length || 0}
                    </span>
                </div>

                {/* Comments List / Empty State */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    {contribution.comments?.length > 0 ? (
                        contribution.comments.map((comment, index) => (
                            <div key={index} className="flex gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-sm">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs">
                                    {comment.author?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {comment.author?.username}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFancyDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {comment.text}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-80 py-10">
                            <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-full mb-2">
                                <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-900 dark:text-white text-lg font-semibold">No comments yet</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs text-center">
                                Be the first to share your thoughts on this contribution.
                            </p>
                        </div>
                    )}
                </div>

                {/* Comment Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-xl py-3 pl-4 pr-12 outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            placeholder="Write a comment..."
                        />
                        <button className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ContributionDetail;