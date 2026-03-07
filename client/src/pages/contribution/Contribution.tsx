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
import Loader from "../../components/layout/Loader";

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

  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localDislikes, setLocalDislikes] = useState<string[]>([]);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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

  // --- Restored RBAC Permissions ---
  const isParagraphAuthor = currentUserId === contribution?.author?.id;
  const isScriptOwner =
    currentUserId === (contribution as any)?.script?.author?.id ||
    currentUserId === (contribution as any)?.script?.author;
  const isCollaboratorAdmin = (
    contribution as any
  )?.script?.collaborators?.some(
    (c: any) =>
      c.user.id === currentUserId &&
      (c.role === "OWNER" || c.role === "EDITOR"),
  );
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

  const handleLike = async () => {
    if (!currentUserId) return alert("Please log in to interact!");
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

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
    } catch {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return alert("Please log in to interact!");
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

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
    } catch {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
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
    } catch {
      setLocalComments((prev) =>
        prev.filter((c) => c.createdAt !== newComment.createdAt),
      );
      alert("Failed to send comment. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddComment();
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return alert("Paragraph cannot be empty.");
    try {
      await editParagraph({ variables: { paragraphId: id, text: editText } });
      setIsEditing(false);
    } catch {
      alert("Failed to save changes.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteParagraph({ variables: { paragraphId: id } });
      navigate(-1);
    } catch {
      alert("Failed to delete paragraph.");
    }
  };

  // --- Unique Variants to prevent Layout Collisions ---
  const pageVariants: Variants = {
    fadeInit: { opacity: 0, y: 15 },
    fadeShow: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
    fadeExit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const itemVariants: Variants = {
    fadeInit: { opacity: 0, y: 10 },
    fadeShow: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center w-full min-h-[90vh] gap-4"
        >
          <Loader />
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
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
      ) : !contribution ? (
        <Navigate key="redirect" to="/explore" replace />
      ) : (
        <motion.div
          key="content"
          variants={pageVariants}
          initial="fadeInit"
          animate="fadeShow"
          exit="fadeExit"
          className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4 gap-4"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"
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
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : contribution.status === "rejected"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {contribution.status}
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex flex-col gap-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg shadow-inner">
                  {contribution.author?.username?.charAt(0).toUpperCase() || (
                    <User className="w-5 h-5" />
                  )}
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
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
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
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20"
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
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-5 border border-gray-100 dark:border-white/5 shadow-inner">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full min-h-[150px] p-4 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y leading-relaxed shadow-sm"
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
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 font-['Literata'] leading-relaxed"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {contribution.text}
                    </ReactMarkdown>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm ${
                  hasLiked
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
                }`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`}
                />
                {localLikes.length}
              </button>

              <button
                onClick={handleDislike}
                disabled={isDisliking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm ${
                  hasDisliked
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
                }`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${hasDisliked ? "fill-current" : ""}`}
                />
                {localDislikes.length}
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center gap-2 bg-gray-50/50 dark:bg-transparent">
              <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">
                Discussion
              </h3>
              <span className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-bold ml-2">
                {localComments.length}
              </span>
            </div>

            <div className="p-5 flex flex-col gap-5 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <AnimatePresence>
                {localComments.length > 0 ? (
                  localComments.map((comment, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm shadow-sm mt-0.5">
                        {comment.author?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm w-full shadow-sm">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            @{comment.author.username}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                            {formatFancyDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-80">
                    <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-3">
                      <MessageSquare className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-900 dark:text-white text-base font-bold">
                      No comments yet
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Be the first to share your thoughts.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/10">
              <div className="relative flex items-center">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isCommenting}
                  className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500/50 text-gray-900 dark:text-white rounded-xl py-3 pl-4 pr-14 outline-none transition-all placeholder:text-gray-500 shadow-inner"
                  placeholder="Write a comment..."
                />
                <button
                  onClick={handleAddComment}
                  disabled={isCommenting || !commentText.trim()}
                  className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 shadow-md"
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
      )}
    </AnimatePresence>
  );
};

export default ContributionDetail;
