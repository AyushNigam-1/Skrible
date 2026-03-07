import { useEffect, useState } from "react";
import {
  useParams,
  Outlet,
  useOutletContext,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Import generated hooks
import {
  useGetScriptByIdQuery,
  useGetUserProfileQuery,
  useLikeScriptMutation,
  useDislikeScriptMutation,
  useToggleBookmarkMutation,
} from "../graphql/generated/graphql";

import Tabs from "../components/layout/Tabs";
import Loader from "../components/layout/Loader";
import { ThumbsUp, ThumbsDown, Bookmark, Loader2 } from "lucide-react";
import InviteModal from "../components/modal/InviteModal";

interface LayoutContext {
  path?: string;
}

const DraftLayout = () => {
  const { id } = useParams<{ id: string }>();
  const { path } = useOutletContext<LayoutContext>() || {};
  const location = useLocation(); // Used to trigger AnimatePresence on route changes

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.id;
  const currentUsername = currentUser?.username;

  // Added explicit types to state
  const [request, setRequest] = useState<any>(null);
  const [tab, setTab] = useState<string>("Timeline");

  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localDislikes, setLocalDislikes] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Replaced generic useQuery with generated hooks
  const { data, loading, error, refetch } = useGetScriptByIdQuery({
    variables: { id: id || "" },
    skip: !id,
  });

  const { data: userData } = useGetUserProfileQuery({
    variables: { username: currentUsername || "" },
    skip: !currentUsername,
  });

  // Replaced generic useMutation with generated hooks
  const [likeScript, { loading: isLiking }] = useLikeScriptMutation();
  const [dislikeScript, { loading: isDisliking }] = useDislikeScriptMutation();
  const [toggleBookmark, { loading: isBookmarking }] =
    useToggleBookmarkMutation();

  const script = data?.getScriptById;

  useEffect(() => {
    if (script) {
      // Type casting to string[] in case the generated type allows nulls
      setLocalLikes((script.likes as string[]) || []);
      setLocalDislikes((script.dislikes as string[]) || []);
    }
    // if (userData?.getUserProfile?.favourites && id) {
    //   setIsBookmarked(userData.getUserProfile.favourites.includes(id));
    // }
    // if (!request && script?.requests && script.requests.length > 0) {
    //   setRequest(script.requests[0]);
    // }
  }, [script, userData, request, id]);

  const isLiked = localLikes.includes(currentUserId);
  const isDisliked = localDislikes.includes(currentUserId);

  if (error)
    return (
      <div className="p-4 text-red-500 font-mono text-sm tracking-widest uppercase flex justify-center items-center h-full">
        Error: {JSON.stringify(error)}
      </div>
    );

  const handleLike = async () => {
    /* ... existing logic ... */
  };
  const handleDislike = async () => {
    /* ... existing logic ... */
  };
  const handleBookmark = async () => {
    /* ... existing logic ... */
  };

  // --- Framer Motion Variants ---
  const layoutVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      filter: "blur(4px)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={layoutVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative flex flex-col gap-6 w-full max-w-7xl mx-auto ${
        path === "zen" ? "max-w-none px-0 pt-0" : ""
      }`}
    >
      {path !== "zen" && script && (
        <motion.div variants={contentVariants} className="flex flex-col gap-6">
          {/* Header Row: Title & Actions aligned horizontally */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Left: Title & Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {script.title}
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 rounded-xl shrink-0 mt-4 md:mt-0">
              <button
                onClick={handleLike}
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

          {path !== "zen" && (
            <div className="sticky top-0 z-40 ">
              <Tabs setTab={setTab} tab={tab} scriptId={id} />
            </div>
          )}
          <hr className="border-white/10 relative z-10" />
        </motion.div>
      )}

      {loading ? (
        // Perfectly centered Loader
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full min-h-[96vh] flex-1 flex  items-center justify-center"
        >
          <Loader />
        </motion.div>
      ) : (
        <div className="w-full relative z-10 flex-1">
          {/*<AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >*/}
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
          {/*</motion.div>
          </AnimatePresence>*/}
        </div>
      )}
    </motion.div>
  );
};

export default DraftLayout;
