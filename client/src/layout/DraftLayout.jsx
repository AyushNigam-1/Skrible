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
import InviteModal from "../components/modal/InviteModal";
import {
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

  const [request, setRequest] = useState(null);
  const [tab, setTab] = useState("Timeline");

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
    /* ... existing logic ... */
  };
  const handleDislike = async () => {
    /* ... existing logic ... */
  };
  const handleBookmark = async () => {
    /* ... existing logic ... */
  };

  return (
    <div
      className={`relative flex flex-col gap-6 w-full max-w-6xl mx-auto animate-in fade-in duration-500 ${path === "zen" ? "max-w-none px-0 pt-0" : ""}`}
    >
      <InviteModal
        isOpen={isInviteOpen}
        setIsOpen={setIsInviteOpen}
        scriptTitle={script?.title}
      />

      {path !== "zen" && script && (
        <div className="flex flex-col gap-6">
          {/* Header Row: Title & Actions aligned horizontally */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Left: Title & Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {script.title}
              </h1>
            </div>

            {/* Sub-meta (Author, Date, Tags) */}
            {/* <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 font-medium">
                <span className="text-white">
                  @{script.author?.username}
                </span>
                {script.genres?.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span>{script.genres.join(", ")}</span>
                  </>
                )}
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest`}
                >
                  {script.visibility === "Public" ? (
                    <Globe2 className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {script.visibility}
                </span>
              </div>*/}

            {/* Right: Actions */}
            <div className="flex items-center gap-2 rounded-xl shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${isLiked ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                />{" "}
                <span>{localLikes.length}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${isDisliked ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`}
                />{" "}
                <span>{localDislikes.length}</span>
              </button>
              <div className="w-[1px] h-4 bg-white/20 mx-1" />
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-all ${isBookmarked ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                {isBookmarking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                )}
              </button>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <hr className="border-white/10 relative z-10" />
          {/* Collapsed Description */}
          {/* <p className="text-gray-400  leading-relaxed  line-clamp-3">
            {script.description ||
              "No description provided for this draft. Check the about section for more lore."}
          </p>*/}
          {path !== "zen" && (
            <div className="sticky top-0 z-40 ">
              <Tabs setTab={setTab} tab={tab} scriptId={id} />
            </div>
          )}
          <hr className="border-white/10 relative z-10" />
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-32">
          <Loader />
        </div>
      ) : (
        <div className="w-full relative z-10">
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
