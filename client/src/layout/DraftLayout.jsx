import { useEffect, useState } from "react";
import { useParams, Outlet, useOutletContext } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { GET_SCRIPT_BY_ID } from "../graphql/query/scriptQueries";
import {
  LIKE_SCRIPT,
  DISLIKE_SCRIPT,
} from "../graphql/mutation/scriptMutations";
import { TOGGLE_BOOKMARK } from "../graphql/mutation/userMutations";
import { GET_USER_PROFILE } from "../graphql/query/userQueries";

import Tabs from "../components/Tabs";
import Loader from "../components/Loader";
import InviteModal from "../components/InviteModal";
import {
  User,
  Tag,
  Globe,
  Calendar,
  Lock,
  Globe2,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Loader2,
} from "lucide-react";

const DraftLayout = () => {
  const { id } = useParams();
  const { path } = useOutletContext();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.id;
  const currentUsername = currentUser?.username;

  const [cursorClass, setCursorClass] = useState("cursor-default");
  const [request, setRequest] = useState(null);
  const [tab, setTab] = useState("Script");

  const [localLikes, setLocalLikes] = useState([]);
  const [localDislikes, setLocalDislikes] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_SCRIPT_BY_ID, {
    variables: { id },
    skip: !id,
  });
  const { data: userData } = useQuery(GET_USER_PROFILE, {
    variables: { username: currentUsername },
    skip: !currentUsername,
  });

  const [likeScript, { loading: isLiking }] = useMutation(LIKE_SCRIPT);
  const [dislikeScript, { loading: isDisliking }] = useMutation(DISLIKE_SCRIPT);
  const [toggleBookmark, { loading: isBookmarking }] =
    useMutation(TOGGLE_BOOKMARK);

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

  if (error)
    return (
      <div className="p-4 text-red-500 font-mono text-sm tracking-widest uppercase">
        Error: {JSON.stringify(error)}
      </div>
    );

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(Number(timestamp)));
  };

  const handleLike = async () => {
    if (!currentUserId) return alert("Please login to like");
    try {
      await likeScript({ variables: { scriptId: id } });
      if (isLiked) {
        setLocalLikes(localLikes.filter((uid) => uid !== currentUserId));
      } else {
        setLocalLikes([...localLikes, currentUserId]);
        setLocalDislikes(localDislikes.filter((uid) => uid !== currentUserId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return alert("Please login to dislike");
    try {
      await dislikeScript({ variables: { scriptId: id } });
      if (isDisliked) {
        setLocalDislikes(localDislikes.filter((uid) => uid !== currentUserId));
      } else {
        setLocalDislikes([...localDislikes, currentUserId]);
        setLocalLikes(localLikes.filter((uid) => uid !== currentUserId));
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
    setIsInviteOpen(true);
  };

  return (
    <div
      className={`relative ${path === "zen" ? "w-full" : `flex flex-col gap-6 w-full max-w-7xl mx-auto ${cursorClass}`} animate-in fade-in duration-500 pb-20`}
    >
      <InviteModal
        isOpen={isInviteOpen}
        setIsOpen={setIsInviteOpen}
        scriptTitle={script?.title}
      />

      {path !== "zen" && script && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 relative z-10">
            <h1 className="text-4xl md:text-4xl font-extrabold font-['Inter'] bg-clip-text text-gray-200 tracking-tight leading-tight">
              {script.title}
            </h1>
            <div className="shrink-0 mt-2 md:mt-0">
              <span
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.2)] ${
                  script.visibility === "Public"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {script.visibility === "Public" ? (
                  <Globe2 className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                {script.visibility}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-lg text-gray-400 text-semibold line-clamp-2">
              {script.description ||
                "No description provided for this draft. Awaiting initial input buffer..."}
            </p>
          </div>

          <hr className="border-white/10 relative z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center bg-black/40 border border-white/10 p-1.5 rounded-2xl shrink-0 backdrop-blur-md">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all disabled:opacity-50 ${
                  isLiked
                    ? "bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ThumbsUp
                  className={`w-4 h-4 transition-transform active:scale-75 ${isLiked ? "fill-current" : ""}`}
                />
                <span>{localLikes.length}</span>
              </button>

              <div className="w-[1px] h-6 bg-white/10 mx-1" />

              <button
                onClick={handleDislike}
                disabled={isDisliking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all disabled:opacity-50 ${
                  isDisliked
                    ? "bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ThumbsDown
                  className={`w-4 h-4 transition-transform active:scale-75 ${isDisliked ? "fill-current" : ""}`}
                />
                <span>{localDislikes.length}</span>
              </button>

              <div className="w-[1px] h-6 bg-white/10 mx-1" />

              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all disabled:opacity-50 ${
                  isBookmarked
                    ? "bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isBookmarking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark
                    className={`w-4 h-4 transition-transform active:scale-75 ${isBookmarked ? "fill-current" : ""}`}
                  />
                )}
              </button>

              <div className="w-[1px] h-6 bg-white/10 mx-1" />

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-mono text-xs font-bold transition-colors uppercase tracking-widest"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-2 bg-black/20 border border-white/5 px-3 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-gray-200">
                  @{script.author?.username}
                </span>
              </div>

              {script.genres?.length > 0 && (
                <div className="flex items-center gap-2 bg-black/20 border border-white/5 px-3 py-1.5 rounded-lg">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate max-w-[200px]">
                    {script.genres.join(" / ")}
                  </span>
                </div>
              )}

              {script.createdAt && (
                <div className="flex items-center gap-2 bg-black/20 border border-white/5 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{formatDate(script.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {path !== "zen" && (
        <div className="sticky top-6 z-40">
          <div className="bg-white/5 p-2 rounded-2xl backdrop-blur-2xl">
            <Tabs setTab={setTab} tab={tab} scriptId={id} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader />
        </div>
      ) : (
        <div className="w-full relative z-10 mt-2">
          <Outlet
            context={{
              request,
              setRequest,
              data,
              refetch,
              setTab,
              tab,
              loading,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DraftLayout;
