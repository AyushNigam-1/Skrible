import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { useAddCommentMutation } from "../../graphql/generated/graphql";
import { useUserStore } from "../../store/useAuthStore";

interface DiscussionPanelProps {
  paragraphId: string;
  initialComments: any[];
}

const DiscussionPanel: React.FC<DiscussionPanelProps> = ({
  paragraphId,
  initialComments,
}) => {
  const { user: currentUser } = useUserStore();
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  const [addComment, { loading: isCommenting }] = useAddCommentMutation();

  // Sync comments when the parent fetches new data
  useEffect(() => {
    setLocalComments(initialComments);
  }, [initialComments]);

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(Number(timestamp)));
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    try {
      const newComment = {
        text: commentText,
        createdAt: Date.now().toString(),
        author: { username: currentUser.username },
      };
      // Optimistic UI update
      setLocalComments((prev) => [...prev, newComment]);
      const currentText = commentText;
      setCommentText("");

      await addComment({
        variables: { paragraphId, text: currentText },
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to post comment.");
      // Revert optimistic update on failure
      setLocalComments(initialComments);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-1 flex flex-col min-h-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-black/20 shrink-0">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <h3 className="font-bold text-white text-sm">Discussion</h3>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
        <AnimatePresence>
          {localComments.length > 0 ? (
            localComments.map((comment, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-start"
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-white font-bold text-sm mt-0.5">
                  {comment.author?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-sm w-full shadow-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-sm text-white">
                      @{comment.author.username}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-80 min-h-[150px]">
              <div className="bg-white/5 p-4 rounded-full mb-3">
                <MessageSquare className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-white text-base font-bold">No comments yet</p>
              <p className="text-gray-400 text-sm mt-1 text-center">
                Be the first to share your thoughts.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 shrink-0">
        <div className="relative flex items-center max-w-5xl mx-auto">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCommenting}
            className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 text-white rounded-xl py-3 pl-4 pr-14 outline-none transition-all placeholder:text-gray-500 shadow-inner"
            placeholder="Write a comment..."
          />
          <button
            onClick={handleAddComment}
            disabled={isCommenting || !commentText.trim()}
            className="absolute right-2 p-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isCommenting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Send className="w-4 h-4 ml-0.5 text-black" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscussionPanel;
