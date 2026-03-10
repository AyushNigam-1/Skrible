import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Tabs from "../components/layout/Tabs";
import Loader from "../components/layout/Loader";
import { ThumbsUp, ThumbsDown, Bookmark, Loader2 } from "lucide-react";
import InviteModal from "../components/modal/InviteModal";
import { useUserStore } from "../store/useAuthStore";
import { useParams, Outlet } from "react-router-dom";
import {
  useDislikeScriptMutation,
  useGetScriptByIdQuery,
  useLikeScriptMutation,
  useToggleBookmarkMutation,
} from "../graphql/generated/graphql";

const DraftLayout = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useUserStore();
  const currentUserId = currentUser?.id;
  const [request, setRequest] = useState<any>(null);
  const [tab, setTab] = useState<string>("Timeline");

  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localDislikes, setLocalDislikes] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const { data, loading, error, refetch } = useGetScriptByIdQuery({
    variables: { id: id || "" },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });

  const [likeScript, { loading: isLiking }] = useLikeScriptMutation();
  const [dislikeScript, { loading: isDisliking }] = useDislikeScriptMutation();
  const [toggleBookmark, { loading: isBookmarking }] =
    useToggleBookmarkMutation();

  const script = data?.getScriptById;

  const isEditorOrOwner = Boolean(
    currentUserId &&
    script &&
    (script.author?.id === currentUserId ||
      script.editors?.some((editor: any) => editor.id === currentUserId)),
  );

  useEffect(() => {
    if (script) {
      setLocalLikes((script.likes as string[]) || []);
      setLocalDislikes((script.dislikes as string[]) || []);
    }

    if (currentUser?.favourites && id) {
      const isFav = currentUser.favourites.some(
        (fav: any) => fav.id === id || fav === id,
      );
      setIsBookmarked(isFav);
    }
  }, [script, currentUser, id]);

  const isLiked = currentUserId ? localLikes.includes(currentUserId) : false;
  const isDisliked = currentUserId
    ? localDislikes.includes(currentUserId)
    : false;

  if (error)
    return (
      <div className="flex justify-center items-center h-full text-red-500 font-mono text-sm tracking-widest uppercase">
        Error: {JSON.stringify(error)}
      </div>
    );

  const handleLike = async () => {
    if (!currentUserId) return alert("Please log in to like this draft.");
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

    if (isLiked) {
      setLocalLikes(prevLikes.filter((userId) => userId !== currentUserId));
    } else {
      setLocalLikes([...prevLikes, currentUserId]);
      setLocalDislikes(
        prevDislikes.filter((userId) => userId !== currentUserId),
      );
    }

    try {
      await likeScript({ variables: { scriptId: id || "" } });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
      console.error("Failed to like script:", err);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return alert("Please log in to dislike this draft.");
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

    if (isDisliked) {
      setLocalDislikes(
        prevDislikes.filter((userId) => userId !== currentUserId),
      );
    } else {
      setLocalDislikes([...prevDislikes, currentUserId]);
      setLocalLikes(prevLikes.filter((userId) => userId !== currentUserId));
    }

    try {
      await dislikeScript({ variables: { scriptId: id || "" } });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
      console.error("Failed to dislike script:", err);
    }
  };

  const handleBookmark = async () => {
    if (!currentUserId) return alert("Please log in to bookmark.");
    const prevBookmark = isBookmarked;
    setIsBookmarked(!prevBookmark);

    try {
      await toggleBookmark({ variables: { scriptId: id || "" } });
    } catch (err) {
      setIsBookmarked(prevBookmark);
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const layoutVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={layoutVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col w-full max-w-7xl mx-auto space-y-6"
    >
      {script && (
        <motion.div
          variants={contentVariants}
          className="flex flex-col space-y-4"
        >
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 px-4 md:px-0">
            {/* Title */}
            <div className="w-full md:w-auto text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
                {script.title}
              </h1>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 border border-white/10 md:border-transparent rounded-2xl p-1.5 md:p-0 w-[max-content] mx-auto md:mx-0">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isLiked
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                />
                <span>{localLikes.length}</span>
              </button>

              <button
                onClick={handleDislike}
                disabled={isDisliking}
                className={`flex items-center space-x-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isDisliked
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`}
                />
                <span>{localDislikes.length}</span>
              </button>

              <div className="w-[1px] h-5 bg-white/10" />

              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`p-2 rounded-xl transition-all ${
                  isBookmarked
                    ? "text-white bg-white/10 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isBookmarking ? (
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Bookmark
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? "fill-current" : ""}`}
                  />
                )}
              </button>

              <InviteModal scriptTitle={script?.title || "Draft"} />
            </div>
          </div>
          <motion.hr className="border-b-0.5 border-white/10" />
          {/* GitHub-style Tabs Container with flush bottom border */}
          <div className="w-full border-b border-white/10">
            <Tabs
              setTab={setTab}
              tab={tab}
              scriptId={id}
              isEditorOrOwner={isEditorOrOwner}
            />
          </div>
        </motion.div>
      )}

      {/* Main Outlet Content */}
      <div className="w-full relative z-10">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[98vh]"
          >
            <Loader />
          </motion.div>
        ) : (
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
        )}
      </div>
    </motion.div>
  );
};

export default DraftLayout;
