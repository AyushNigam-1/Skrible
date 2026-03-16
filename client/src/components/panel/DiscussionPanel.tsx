import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Loader2, SendHorizontal } from "lucide-react";

interface Comment {
  text: string;
  createdAt: string | number;
  author: {
    name: string;
  };
}

interface DiscussionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  isCommenting: boolean;
  formatDate: (timestamp?: string | number) => string;
}

const DiscussionPanel: React.FC<DiscussionPanelProps> = ({
  isOpen,
  onClose,
  isDesktop,
  comments,
  onAddComment,
  isCommenting,
  formatDate,
}) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = async () => {
    if (!commentText.trim() || isCommenting) return;
    await onAddComment(commentText);
    setCommentText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Blur Overlay */}
          <motion.div
            key="discussion-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Discussion Panel */}
          <motion.div
            key="discussion-panel"
            initial={isDesktop ? { x: "120%", y: 0 } : { y: "120%", x: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={isDesktop ? { x: "120%", y: 0 } : { y: "120%", x: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed z-50 flex flex-col overflow-hidden bg-[#161620]
                       /* Mobile styles: added margins and corners */
                       bottom-3 left-3 right-3 h-[65vh] border border-white/10 rounded-3xl
                       /* Desktop styles */
                       md:top-4 md:bottom-4 md:right-4 md:left-auto md:w-[400px] md:h-[calc(100vh-32px)] md:border md:border-white/10 md:rounded-2xl"
          >
            {/* Panel Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0 bg-black/5">
              <h3 className="text-white font-bold text-lg font-sans">
                Comments
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Content Area */}
            <div className="flex-1 flex flex-col h-full w-full bg-transparent overflow-hidden">
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 pb-4">
                <AnimatePresence>
                  {comments.length > 0 ? (
                    comments.map((comment, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-2 items-start"
                      >
                        <div className="px-2 py-1 shrink-0 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-gray-300 font-bold text-xs ">
                          {comment.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-white/5 border space-y-3 border-white/5 p-3 rounded-2xl rounded-tl-sm w-full shadow-sm">
                          <div className="flex justify-between items-center ">
                            <span className=" text-sm text-gray-300">
                              {comment.author.name}
                            </span>
                            <span className="text-xs  tracking-wider font-bold text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-lg text-gray-100 leading-relaxed whitespace-pre-wrap">
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
                      <p className="text-white text-base font-bold">
                        No comments yet
                      </p>
                      <p className="text-gray-400 text-sm mt-1 text-center">
                        Be the first to share your thoughts.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-transparent shrink-0 border border-white/10">
                <div className="relative flex items-center w-full">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isCommenting}
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl py-3 pl-4 pr-14 outline-none transition-all placeholder:text-gray-500 shadow-inner"
                    placeholder="Write a comment..."
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isCommenting || !commentText.trim()}
                    className="absolute right-2 p-2 bg-white hover:bg-gray-600 text-black rounded-full transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isCommenting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <SendHorizontal className="w-4 h-4 text-black" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DiscussionPanel;
