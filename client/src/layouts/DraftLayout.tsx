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

  // --- 1. Calculate Permissions Here ---
  // Checks if the logged-in user is the author OR is in the editors array
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
      <div className="p-4 text-red-500 font-mono text-sm tracking-widest uppercase flex justify-center items-center h-full">
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
      className="relative flex flex-col gap-6 w-full max-w-7xl mx-auto scrollbar-none"
    >
      {script && (
        <motion.div variants={contentVariants} className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {script.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-xl shrink-0 mt-4 md:mt-0">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isLiked
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                />{" "}
                <span>{localLikes.length}</span>
              </button>
              <button
                onClick={handleDislike}
                disabled={isDisliking}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isDisliked
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`}
                />{" "}
                <span>{localDislikes.length}</span>
              </button>
              <div className="w-[1px] h-4 bg-white/20 mx-1" />
              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isBookmarking ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Bookmark
                    size={20}
                    className={`${isBookmarked ? "fill-current" : ""}`}
                  />
                )}
              </button>

              <InviteModal scriptTitle={script?.title || "Draft"} />
            </div>
          </div>
          <hr className="border-white/10 relative z-10" />

          <div className="sticky top-0 z-40 ">
            {/* --- 2. Pass the calculated prop to Tabs --- */}
            <Tabs
              setTab={setTab}
              tab={tab}
              scriptId={id}
              isEditorOrOwner={isEditorOrOwner}
            />
          </div>
          <hr className="border-white/10 relative z-10" />
        </motion.div>
      )}

      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full min-h-[96vh] flex-1 flex items-center justify-center"
        >
          <Loader />
        </motion.div>
      ) : (
        <div className="w-full relative z-10 flex-1">
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
    </motion.div>
  );
};

export default DraftLayout;
