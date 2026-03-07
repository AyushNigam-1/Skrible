import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  User,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react";

import { GET_PARAGRAPH_BY_ID } from "../../graphql/query/paragraphQueries";
import {
  LIKE_PARAGRAPH,
  DISLIKE_PARAGRAPH,
  ADD_COMMENT,
} from "../../graphql/mutation/scriptMutations";
import {
  DELETE_PARAGRAPH,
  EDIT_PARAGRAPH,
} from "../../graphql/mutation/paragraphMutations";

// --- Types ---
interface Author {
  id: string;
  username: string;
}

interface Comment {
  text: string;
  createdAt: string;
  author: Author;
}

interface Contribution {
  id: string;
  text: string;
  status: string;
  createdAt: string;
  author: Author;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
}

interface StoredUser {
  id: string;
  username: string;
}

const ContributionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const currentUser: StoredUser | null = storedUser
    ? JSON.parse(storedUser)
    : null;
  const currentUserId = currentUser?.id;

  // Local State
  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localDislikes, setLocalDislikes] = useState<string[]>([]);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  // Edit & Delete States
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Queries & Mutations
  const { data, loading, error } = useQuery<{ getParagraphById: Contribution }>(
    GET_PARAGRAPH_BY_ID,
    {
      variables: { paragraphId: id },
      skip: !id,
    },
  );

  const [likeParagraph, { loading: isLiking }] = useMutation(LIKE_PARAGRAPH);
  const [dislikeParagraph, { loading: isDisliking }] =
    useMutation(DISLIKE_PARAGRAPH);
  const [addComment, { loading: isCommenting }] = useMutation(ADD_COMMENT);

  const [editParagraph, { loading: isEditingMutation }] =
    useMutation(EDIT_PARAGRAPH);
  const [deleteParagraph, { loading: isDeleting }] =
    useMutation(DELETE_PARAGRAPH);

  const contribution = data?.getParagraphById;

  // 1. Did the current user write this specific paragraph?
  const isParagraphAuthor = currentUserId === contribution?.author?.id;

  // 2. Is the current user the original creator of the entire script?
  const isScriptOwner =
    currentUserId === (contribution as any)?.script?.author?.id ||
    currentUserId === (contribution as any)?.script?.author;

  // 3. Is the current user an invited EDITOR or OWNER on this script?
  const isCollaboratorAdmin = (
    contribution as any
  )?.script?.collaborators?.some(
    (c: any) =>
      c.user.id === currentUserId &&
      (c.role === "OWNER" || c.role === "EDITOR"),
  );

  // THE ULTIMATE CHECK: Can this user modify this paragraph?
  const canModify = isParagraphAuthor || isScriptOwner || isCollaboratorAdmin;

  useEffect(() => {
    if (contribution) {
      setLocalLikes(contribution.likes || []);
      setLocalDislikes(contribution.dislikes || []);
      setLocalComments(contribution.comments || []);
      setEditText(contribution.text || "");
    }
  }, [contribution]);

  const hasLiked = currentUserId ? localLikes.includes(currentUserId) : false;
  const hasDisliked = currentUserId
    ? localDislikes.includes(currentUserId)
    : false;

  const formatFancyDate = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // --- Interaction Handlers ---
  const handleLike = async () => {
    if (!currentUserId) return alert("Please log in to interact!");
    const previousLikes = [...localLikes];
    const previousDislikes = [...localDislikes];

    try {
      if (hasLiked) {
        setLocalLikes((prev) =>
          prev.filter((userId) => userId !== currentUserId),
        );
      } else {
        setLocalLikes((prev) => [...prev, currentUserId]);
        setLocalDislikes((prev) =>
          prev.filter((userId) => userId !== currentUserId),
        );
      }
      await likeParagraph({ variables: { paragraphId: id } });
    } catch (err) {
      console.error("Failed to like:", err);
      setLocalLikes(previousLikes);
      setLocalDislikes(previousDislikes);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return alert("Please log in to interact!");
    const previousLikes = [...localLikes];
    const previousDislikes = [...localDislikes];

    try {
      if (hasDisliked) {
        setLocalDislikes((prev) =>
          prev.filter((userId) => userId !== currentUserId),
        );
      } else {
        setLocalDislikes((prev) => [...prev, currentUserId]);
        setLocalLikes((prev) =>
          prev.filter((userId) => userId !== currentUserId),
        );
      }
      await dislikeParagraph({ variables: { paragraphId: id } });
    } catch (err) {
      console.error("Failed to dislike:", err);
      setLocalLikes(previousLikes);
      setLocalDislikes(previousDislikes);
    }
  };

  const handleAddComment = async () => {
    if (!currentUserId) return alert("Please log in to comment!");
    if (!commentText.trim()) return;

    const newComment: Comment = {
      text: commentText,
      createdAt: Date.now().toString(),
      author: {
        id: currentUserId,
        username: currentUser?.username || "You",
      },
    };

    setCommentText("");
    setLocalComments((prev) => [...prev, newComment]);

    try {
      await addComment({
        variables: { paragraphId: id, text: newComment.text },
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
      setLocalComments((prev) =>
        prev.filter((c) => c.createdAt !== newComment.createdAt),
      );
      alert("Failed to send comment. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddComment();
  };

  // --- Edit & Delete Handlers ---
  const handleSaveEdit = async () => {
    if (!editText.trim()) return alert("Paragraph cannot be empty.");
    try {
      await editParagraph({ variables: { paragraphId: id, text: editText } });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteParagraph({ variables: { paragraphId: id } });
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete the paragraph. Please try again.");
    }
  };

  // --- RENAMED VARIANTS to avoid parent layout collisions ---
  const pageVariants: Variants = {
    enter: { opacity: 0, y: 15 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
    leave: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const itemVariants: Variants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // --- Render States ---
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center w-full min-h-[70vh] gap-4"
      >
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading contribution...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center w-full min-h-[70vh] gap-3 text-center px-4 py-2"
      >
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Failed to load
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {error.message}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  if (!contribution) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="enter" // Used new names here
      animate="center" // Used new names here
      exit="leave" // Used new names here
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Contribution Details
          </h2>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            contribution.status === "approved"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-500/20"
              : contribution.status === "rejected"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-500/20"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/20"
          }`}
        >
          {contribution.status}
        </span>
      </motion.div>

      {/* --- Contribution Content Card --- */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col gap-5 shrink-0 relative overflow-hidden"
      >
        {/* Author Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="px-3 py-3 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg shadow-inner">
              <User className="w-6" />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                @{contribution.author?.username}
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                Submitted {formatFancyDate(contribution.createdAt)}
              </p>
            </div>
          </div>

          {canModify && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Edit Paragraph"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {!isConfirmingDelete ? (
                  <motion.button
                    key="trash"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Paragraph"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/50"
                  >
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 ml-2">
                      Delete?
                    </span>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content Box (View vs Edit Mode) */}
        <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-5 md:p-6 border border-gray-100 dark:border-white/10 shadow-inner">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full min-h-[150px] p-4 bg-white dark:bg-[#130f1c] border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y leading-relaxed"
                  placeholder="Edit your paragraph..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(contribution.text);
                    }}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isEditingMutation}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 active:scale-95 shadow-md"
                  >
                    {isEditingMutation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}{" "}
                    Save
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 font-['Literata']"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ul: ({ children }) => (
                      <ul className="list-disc ml-5 mb-4">{children}</ul>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 leading-relaxed">{children}</p>
                    ),
                  }}
                >
                  {contribution.text}
                </ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Likes / Dislikes */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
              hasLiked
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
            <span>{localLikes.length}</span>
          </button>

          <button
            onClick={handleDislike}
            disabled={isDisliking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
              hasDisliked
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
            }`}
          >
            <ThumbsDown
              className={`w-4 h-4 ${hasDisliked ? "fill-current" : ""}`}
            />
            <span>{localDislikes.length}</span>
          </button>
        </div>
      </motion.div>

      {/* --- Comments Section --- */}
      <motion.div
        variants={itemVariants}
        id="comments-container"
        className="flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="border-b border-gray-200 dark:border-white/10 p-4 shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-transparent">
          <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">
            Discussion
          </h3>
          <span className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-bold ml-2">
            {localComments.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 max-h-[400px]">
          <AnimatePresence>
            {localComments.length > 0 ? (
              localComments.map((comment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white font-bold text-xs mt-1">
                    {comment.author?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col w-full bg-gray-50 dark:bg-black/40 p-4 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        @{comment.author?.username}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500">
                        {formatFancyDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-80 py-10">
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-2">
                  <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-900 dark:text-white text-lg font-bold">
                  No comments yet
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs text-center">
                  Be the first to share your thoughts on this contribution.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment Input Area */}
        <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/10 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCommenting}
              className="w-full bg-white dark:bg-[#130f1c] border border-gray-300 dark:border-white/20 focus:border-blue-500 dark:focus:border-blue-500/50 text-gray-900 dark:text-white rounded-xl py-3 pl-4 pr-14 outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-500 shadow-inner disabled:opacity-50"
              placeholder="Write a comment..."
            />
            <button
              onClick={handleAddComment}
              disabled={isCommenting || !commentText.trim()}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
            >
              {isCommenting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContributionDetail;
