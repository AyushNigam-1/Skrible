import { useEffect, useState } from "react";
import { useParams, Outlet, useOutletContext } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { GET_SCRIPT_BY_ID } from "../graphql/query/scriptQueries";
import { LIKE_SCRIPT, DISLIKE_SCRIPT } from "../graphql/mutation/scriptMutations";
import { TOGGLE_BOOKMARK } from "../graphql/mutation/userMutations";
import { GET_USER_PROFILE } from "../graphql/query/userQueries";

import Tabs from "../components/Tabs";
import Loader from "../components/Loader";
import InviteModal from "../components/InviteModal"; // Import the modal we created
import {
    User, Tag, Globe, Calendar, Lock, Globe2,
    ThumbsUp, ThumbsDown, Bookmark, Share2, Check, Loader2, Settings
} from "lucide-react";

const DraftLayout = () => {
    const { id } = useParams();
    const { path } = useOutletContext();

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = currentUser?.id;
    const currentUsername = currentUser?.username;

    const [cursorClass, setCursorClass] = useState("cursor-default");
    const [request, setRequest] = useState(null);
    const [tab, setTab] = useState("Script");

    const [localLikes, setLocalLikes] = useState([]);
    const [localDislikes, setLocalDislikes] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false); // Modal state

    const { data, loading, error, refetch } = useQuery(GET_SCRIPT_BY_ID, { variables: { id }, skip: !id });
    const { data: userData } = useQuery(GET_USER_PROFILE, { variables: { username: currentUsername }, skip: !currentUsername });

    const [likeScript, { loading: isLiking }] = useMutation(LIKE_SCRIPT);
    const [dislikeScript, { loading: isDisliking }] = useMutation(DISLIKE_SCRIPT);
    const [toggleBookmark, { loading: isBookmarking }] = useMutation(TOGGLE_BOOKMARK);

    const script = data?.getScriptById;

    useEffect(() => {
        if (script) {
            setLocalLikes(script.likes || []);
            setLocalDislikes(script.dislikes || []);
        }
        if (userData?.getUserProfile?.favourites) {
            setIsBookmarked(userData.getUserProfile.favourites.includes(id));
        }
        if (!request && script?.requests) {
            setRequest(script.requests[0]);
        }
    }, [script, userData, request, id]);

    const isLiked = localLikes.includes(currentUserId);
    const isDisliked = localDislikes.includes(currentUserId);

    if (error) return <div className="p-4 text-red-500 font-['Inter']">Error: {JSON.stringify(error)}</div>;

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(Number(timestamp)));
    };

    // --- COMPLETED HANDLERS ---

    const handleLike = async () => {
        if (!currentUserId) return alert("Please login to like");
        try {
            await likeScript({ variables: { scriptId: id } });
            // Optimistic UI Update
            if (isLiked) {
                setLocalLikes(localLikes.filter(uid => uid !== currentUserId));
            } else {
                setLocalLikes([...localLikes, currentUserId]);
                setLocalDislikes(localDislikes.filter(uid => uid !== currentUserId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDislike = async () => {
        if (!currentUserId) return alert("Please login to dislike");
        try {
            await dislikeScript({ variables: { scriptId: id } });
            // Optimistic UI Update
            if (isDisliked) {
                setLocalDislikes(localDislikes.filter(uid => uid !== currentUserId));
            } else {
                setLocalDislikes([...localDislikes, currentUserId]);
                setLocalLikes(localLikes.filter(uid => uid !== currentUserId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBookmark = async () => {
        if (!currentUserId) return alert("Please login to bookmark");
        try {
            await toggleBookmark({ variables: { scriptId: id } });
            setIsBookmarked(!isBookmarked);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = () => {
        setIsInviteOpen(true); // Open the beautiful glassmorphism invite modal
    };

    return (
        <div className={`relative font-['Inter'] ${path === 'zen' ? 'w-full' : `flex flex-col gap-6 w-full max-w-6xl mx-auto ${cursorClass}`}`}>

            {/* Invite/Settings Modal */}
            <InviteModal
                isOpen={isInviteOpen}
                setIsOpen={setIsInviteOpen}
                scriptTitle={script?.title}
            />

            {path !== 'zen' && script && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
                    <div className="flex justify-between items-start gap-4">
                        <h1 className="text-4xl font-bold font-['Inter'] text-gray-900 dark:text-white tracking-tight">
                            {script.title}
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shrink-0 bg-white/5 border-white/10 text-gray-900 dark:text-gray-200 shadow-sm`}>
                                {script.visibility === 'Public' ? <Globe2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                {script.visibility}
                            </span>
                        </div>
                    </div>

                    <p className="font-['Literata'] text-lg text-gray-800 dark:text-gray-300 leading-relaxed max-w-4xl">
                        {script.description || "No description provided for this draft."}
                    </p>

                    <hr className="border-white/10" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/5 border border-white/10 p-1.5 rounded-full text-gray-800 dark:text-gray-200 shadow-sm">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-gray-900 dark:text-gray-200">@{script.author?.username}</span>
                            </div>

                            {script.genres?.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span>{script.genres.join(", ")}</span>
                                </div>
                            )}

                            {script.createdAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span>{formatDate(script.createdAt)}</span>
                                </div>
                            )}
                        </div>

                        {/* --- Action Buttons --- */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleLike}
                                disabled={isLiking}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 ${isLiked
                                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-inner'
                                    : 'bg-white/5 border border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm">{localLikes.length}</span>
                            </button>

                            <button
                                onClick={handleDislike}
                                disabled={isDisliking}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 ${isDisliked
                                    ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 shadow-inner'
                                    : 'bg-white/5 border border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                                <span className="text-sm">{localDislikes.length}</span>
                            </button>

                            <button
                                onClick={handleBookmark}
                                disabled={isBookmarking}
                                className={`p-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 ${isBookmarked
                                    ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                                    : 'bg-white/5 border border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                {isBookmarking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />}
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10 font-semibold transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                <span className="text-sm hidden sm:inline">Invite</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {path !== 'zen' && (
                <div className="sticky top-0 z-20 pt-2 pb-2 backdrop-blur-xl rounded-b-xl -mx-2 px-2 shadow-sm">
                    <Tabs setTab={setTab} tab={tab} scriptId={id} />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader />
                </div>
            ) : (
                <div className="w-full relative z-10">
                    <Outlet context={{ request, setRequest, data, refetch, setTab, tab, loading }} />
                </div>
            )}
        </div>
    );
};

export default DraftLayout;