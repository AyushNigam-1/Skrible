import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Loader2, SendHorizontal } from "lucide-react";

interface Comment {
  text: string;
  createdAt: string | number;
  author: {
    name?: string;
    username?: string;
  };
}

interface DiscussionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  isCommenting: boolean;
  // We can ignore the old formatDate prop, we will use a custom WhatsApp-style one below
  formatDate: (timestamp?: string | number) => string;
  currentUserName?: string;
}

const DiscussionPanel: React.FC<DiscussionPanelProps> = ({
  isOpen,
  onClose,
  comments,
  onAddComment,
  isCommenting,
  currentUserName,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isOpen]);

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

  // 🚨 NEW: Minimal WhatsApp-style Date Formatter (e.g. "thu, 2:30 pm")
  const formatMinimalTime = (timestamp?: string | number) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(date).toUpperCase();
  };

  if (!isMounted) return null;

  // Ultra-safe current user check
  const safeCurrentUserName = currentUserName?.trim().toLowerCase() || "";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ isolation: 'isolate' }}>

          {/* Background Blur Overlay */}
          <motion.div
            key="discussion-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Centered Modal */}
          <motion.div
            key="discussion-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative z-10 flex flex-col w-full max-w-2xl h-[75vh] min-h-[500px] max-h-[85vh] bg-[#161620] border border-white/10 rounded-3xl shadow-2xl overflow-hidden font-sans"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-white/10 shrink-0 bg-white/5">
              <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                Discussion
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95 outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Area (Scrollable) */}
            <div className="flex-1 flex flex-col h-full w-full bg-transparent overflow-hidden">
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                <AnimatePresence>
                  {comments.length > 0 ? (
                    comments.map((comment, i) => {
                      const authorName = comment.author?.name || comment.author?.username || "Unknown";

                      // 🚨 Strict comparison to push current user to the right
                      const isCurrentUser = safeCurrentUserName !== "" && authorName.trim().toLowerCase() === safeCurrentUserName;

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          // Force container to push right or left
                          className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          {/* 🚨 THE FIX: items-start aligns the avatar to the TOP of the bubble */}
                          <div className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>

                            {/* Avatar */}
                            <div className={`size-8 sm:size-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs shadow-inner mt-0.5 ${isCurrentUser
                              ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-200"
                              : "bg-white/10 border border-white/10 text-gray-300"
                              }`}>
                              {authorName.charAt(0).toUpperCase()}
                            </div>

                            {/* Chat Bubble - WhatsApp Style */}
                            <div className={`flex flex-col p-2.5 sm:p-3 pb-1.5 sm:pb-1.5 min-w-[100px] shadow-sm ${isCurrentUser
                              ? "bg-indigo-600/20 border border-indigo-500/30 rounded-2xl rounded-tr-sm" // Top-Right Tail
                              : "bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm" // Top-Left Tail
                              }`}>

                              {/* Username (Only for others, inside the bubble) */}
                              {!isCurrentUser && (
                                <span className="text-sm font-semibold text-gray-400 mb-0.5">
                                  {authorName}
                                </span>
                              )}

                              {/* Message Text */}
                              <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${isCurrentUser ? "text-indigo-50" : "text-gray-200"
                                }`}>
                                {comment.text}
                              </p>

                              {/* Minimal Timestamp (Bottom Right) */}
                              <span className={`text-[10px] sm:text-[11px] font-mono font-medium self-end mt-1 opacity-70 ${isCurrentUser ? "text-indigo-200" : "text-gray-400"
                                }`}>
                                {formatMinimalTime(comment.createdAt)}
                              </span>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-80 min-h-[200px]">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-full mb-4 shadow-inner">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-white text-lg font-bold tracking-tight">
                        No comments yet
                      </p>
                      <p className="text-gray-400 text-sm mt-1 text-center max-w-xs">
                        Be the first to share your thoughts on this contribution.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area (Sticky Bottom) */}
              <div className="p-4 sm:p-5 bg-white/[0.02] shrink-0 border-t border-white/10 backdrop-blur-md">
                <div className="relative flex items-center w-full">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isCommenting}
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl py-3.5 pl-4 pr-14 outline-none transition-all placeholder:text-gray-500 shadow-inner text-sm sm:text-base"
                    placeholder="Write a comment..."
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isCommenting || !commentText.trim()}
                    className="absolute right-2.5 p-2 bg-white hover:bg-gray-300 text-black rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    {isCommenting ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-black" />
                    ) : (
                      <SendHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DiscussionPanel;