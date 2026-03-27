import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Tabs from "../../components/layout/Tabs";
import Loader from "../../components/layout/Loader";
import { ThumbsUp, ThumbsDown, Bookmark, Loader2, AlertTriangle } from "lucide-react";
import { useUserStore } from "../../store/useAuthStore";
import { useParams, Outlet } from "react-router-dom";
import {
  useDislikeScriptMutation,
  useGetScriptByIdQuery,
  useLikeScriptMutation,
  useToggleBookmarkMutation,
} from "../../graphql/generated/graphql";
import { toast } from "sonner";

const DraftLayout = () => {
  const { id } = useParams<{ id: string }>();

  const currentUser = useUserStore((state: any) => state.user);
  const setUser = useUserStore((state: any) => state.setUser);

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
  const [toggleBookmark, { loading: isBookmarking }] = useToggleBookmarkMutation();

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
        (fav: any) => (typeof fav === 'string' ? fav === id : fav?.id === id)
      );
      setIsBookmarked(isFav);
    }
  }, [script, currentUser?.favourites, id]);

  const isLiked = currentUserId ? localLikes.includes(currentUserId) : false;
  const isDisliked = currentUserId ? localDislikes.includes(currentUserId) : false;

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please log in to like this draft.");
      return;
    }
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

    if (isLiked) {
      setLocalLikes(prevLikes.filter((userId) => userId !== currentUserId));
    } else {
      setLocalLikes([...prevLikes, currentUserId]);
      setLocalDislikes(prevDislikes.filter((userId) => userId !== currentUserId));
    }

    try {
      await likeScript({ variables: { scriptId: id || "" } });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
      toast.error("Failed to like script.");
      console.error("Failed to like script:", err);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) {
      toast.error("Please log in to dislike this draft.");
      return;
    }
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];
    if (isDisliked) {
      setLocalDislikes(prevDislikes.filter((userId) => userId !== currentUserId));
    } else {
      setLocalDislikes([...prevDislikes, currentUserId]);
      setLocalLikes(prevLikes.filter((userId) => userId !== currentUserId));
    }

    try {
      await dislikeScript({ variables: { scriptId: id || "" } });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
      toast.error("Failed to dislike script.");
      console.error("Failed to dislike script:", err);
    }
  };

  const handleBookmark = () => {
    if (!currentUserId) {
      toast.error("Please log in to bookmark.");
      return;
    }

    const prevBookmark = isBookmarked;
    setIsBookmarked(!prevBookmark);

    const promise = toggleBookmark({ variables: { scriptId: id || "" } })
      .then(() => {
        if (setUser && currentUser) {
          const currentFavs = currentUser.favourites || [];

          const updatedFavs = !prevBookmark
            ? [...currentFavs, id]
            : currentFavs.filter((fav: any) => typeof fav === 'string' ? fav !== id : fav?.id !== id);

          const updatedUser = { ...currentUser, favourites: updatedFavs };

          setUser(updatedUser);
        }
      })
      .catch((err) => {
        setIsBookmarked(prevBookmark);
        console.error("Failed to toggle bookmark:", err);
        throw err;
      });

    toast.promise(promise, {
      loading: !prevBookmark ? "Saving to bookmarks..." : "Removing from bookmarks...",
      success: !prevBookmark ? "Saved to bookmarks!" : "Removed from bookmarks.",
      error: "Failed to update bookmark.",
    });
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
      className="relative flex flex-col w-full max-w-7xl mx-auto space-y-6 min-h-[50vh]"
    >
      {error ? (
        <div className="flex flex-col justify-center items-center h-full text-red-500 font-mono py-20">
          <AlertTriangle className="w-10 h-10 mb-4 opacity-50" />
          <p className="text-sm tracking-widest uppercase font-bold">Failed to load Draft</p>
          <p className="text-xs text-red-400/70 mt-2 max-w-md text-center">{error.message}</p>
        </div>
      ) : (
        <>
          {script && (
            <motion.div
              variants={contentVariants}
              className="flex flex-col space-y-4"
            >
              {/* 🚨 THE FIX: Forced horizontal alignment, zero vertical stacking */}
              <div className="flex flex-row items-center justify-between gap-4  w-full">

                {/* Title (Truncates if too long on mobile to protect the buttons) */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight truncate">
                    {script.title}
                  </h1>
                </div>

                {/* Action Toolbar (Locked to the right side) */}
                <div className="flex items-center shrink-0 gap-1 sm:gap-2 bg-white/5 md:bg-transparent border border-white/10 md:border-transparent rounded-xl p-1 md:p-0">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${isLiked
                      ? "bg-white/10 text-white shadow-sm border border-white/10 md:border-transparent"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    <span>{localLikes.length}</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    disabled={isDisliking}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${isDisliked
                      ? "bg-white/10 text-white shadow-sm border border-white/10 md:border-transparent"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`} />
                    <span>{localDislikes.length}</span>
                  </button>

                  <div className="w-[1px] h-5 bg-white/10 mx-1 md:mx-0" />

                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${isBookmarked
                      ? "text-white bg-white/10 shadow-sm border border-white/10 md:border-transparent"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                  >
                    {isBookmarking ? (
                      <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? "fill-current" : ""}`} />
                    )}
                  </button>
                </div>
              </div>
              <motion.hr className="border-b-0.5 border-white/10" />

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
            {loading && !data ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[50vh]"
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
        </>
      )}
    </motion.div>
  );
};

export default DraftLayout;