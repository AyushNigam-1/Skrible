import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    ArrowLeft,
    Send,
    MessageSquare,
    User,
    AlertCircle,
    Loader2,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import useElementHeight from '../../hooks/useElementOffset';

import { GET_PARAGRAPH_BY_ID } from '../../graphql/query/paragraphQueries';
import {
    LIKE_PARAGRAPH,
    DISLIKE_PARAGRAPH,
    ADD_COMMENT
} from '../../graphql/mutation/scriptMutations';

const ContributionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const commentsHeight = useElementHeight('comments-container');

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = currentUser?.id;

    // Local State
    const [localLikes, setLocalLikes] = useState([]);
    const [localDislikes, setLocalDislikes] = useState([]);
    const [localComments, setLocalComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    // Queries & Mutations
    const { data, loading, error } = useQuery(GET_PARAGRAPH_BY_ID, {
        variables: { paragraphId: id },
        skip: !id,
    });

    const [likeParagraph, { loading: isLiking }] = useMutation(LIKE_PARAGRAPH);
    const [dislikeParagraph, { loading: isDisliking }] = useMutation(DISLIKE_PARAGRAPH);
    const [addComment, { loading: isCommenting }] = useMutation(ADD_COMMENT);

    const contribution = data?.getParagraphById;

    // Sync arrays when data loads
    useEffect(() => {
        if (contribution) {
            setLocalLikes(contribution.likes || []);
            setLocalDislikes(contribution.dislikes || []);
            setLocalComments(contribution.comments || []);
        }
    }, [contribution]);

    const hasLiked = localLikes.includes(currentUserId);
    const hasDisliked = localDislikes.includes(currentUserId);

    const formatFancyDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(Number(timestamp));
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        }).format(date);
    };

    // --- Interaction Handlers ---
    const handleLike = async () => {
        if (!currentUserId) return alert("Please log in to interact!");
        const previousLikes = [...localLikes];
        const previousDislikes = [...localDislikes];

        try {
            if (hasLiked) {
                setLocalLikes(prev => prev.filter(userId => userId !== currentUserId));
            } else {
                setLocalLikes(prev => [...prev, currentUserId]);
                setLocalDislikes(prev => prev.filter(userId => userId !== currentUserId));
            }
            await likeParagraph({ variables: { paragraphId: id } });
        } catch (err) {
            console.error("Failed to like:", err);
            setLocalLikes(previousLikes);
            setLocalDislikes(previousDislikes);
        }
    };

    const handleDislike = async () => {
        if (!currentUserId) return alert("Please log in to interact!");
        const previousLikes = [...localLikes];
        const previousDislikes = [...localDislikes];

        try {
            if (hasDisliked) {
                setLocalDislikes(prev => prev.filter(userId => userId !== currentUserId));
            } else {
                setLocalDislikes(prev => [...prev, currentUserId]);
                setLocalLikes(prev => prev.filter(userId => userId !== currentUserId));
            }
            await dislikeParagraph({ variables: { paragraphId: id } });
        } catch (err) {
            console.error("Failed to dislike:", err);
            setLocalLikes(previousLikes);
            setLocalDislikes(previousDislikes);
        }
    };

    // --- Comment Handler ---
    const handleAddComment = async () => {
        if (!currentUserId) return alert("Please log in to comment!");
        if (!commentText.trim()) return;

        // 1. Create a temporary optimistic comment
        const newComment = {
            text: commentText,
            createdAt: Date.now().toString(),
            author: {
                id: currentUserId,
                username: currentUser.username || "You"
            }
        };

        // 2. Clear input and update UI instantly
        setCommentText("");
        setLocalComments(prev => [...prev, newComment]);

        try {
            // 3. Fire the mutation to save to DB
            await addComment({
                variables: { paragraphId: id, text: newComment.text }
            });
        } catch (err) {
            console.error("Failed to add comment:", err);
            // Revert UI if server fails by filtering out the optimistic comment
            setLocalComments(prev => prev.filter(c => c.createdAt !== newComment.createdAt));
            alert("Failed to send comment. Please try again.");
        }
    };

    // Allow submission via "Enter" key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddComment();
        }
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

    if (!contribution) {
        return <Navigate to="/explore" replace />;
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">

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

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${contribution.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    contribution.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {contribution.status}
                </span>
            </div>

            {/* --- Contribution Content Card --- */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-5 shrink-0">

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

                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 ${hasLiked
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{localLikes.length}</span>
                    </button>

                    <button
                        onClick={handleDislike}
                        disabled={isDisliking}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 ${hasDisliked
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <ThumbsDown className={`w-4 h-4 ${hasDisliked ? 'fill-current' : ''}`} />
                        <span>{localDislikes.length}</span>
                    </button>
                </div>
            </div>

            {/* --- Comments Section --- */}
            <div
                id="comments-container"
                className="flex flex-col bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
                style={{ height: commentsHeight || '50vh' }}
            >
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 shrink-0 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Discussion</h3>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold ml-2">
                        {localComments.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    {localComments.length > 0 ? (
                        localComments.map((comment, index) => (
                            // CHANGED: Removed the background/border from this outer flex container and added items-start
                            <div key={index} className="flex gap-3 items-start">

                                {/* Avatar sits outside the bubble */}
                                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs mt-1">
                                    {comment.author?.username?.charAt(0).toUpperCase()}
                                </div>

                                {/* CHANGED: Added background, padding, border, and border-radius directly to the text bubble */}
                                <div className="flex flex-col w-full bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700/80 shadow-sm">
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
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isCommenting}
                            className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-xl py-3 pl-4 pr-12 outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50"
                            placeholder="Write a comment..."
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={isCommenting || !commentText.trim()}
                            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-blue-600"
                        >
                            {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionDetail;