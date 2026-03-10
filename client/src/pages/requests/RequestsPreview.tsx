import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Import generated hooks
import {
  useGetParagraphByIdQuery,
  useGetScriptByIdQuery,
  useApproveParagraphMutation,
  useRejectParagraphMutation,
  useLikeParagraphMutation,
  useDislikeParagraphMutation,
  useEditParagraphMutation,
  useDeleteParagraphMutation,
} from "../../graphql/generated/graphql";

import Loader from "../../components/layout/Loader";
import { useUserStore } from "../../store/useAuthStore";
import DiscussionPanel from "../../components/panel/DiscussionPanel";

// Faster, snappier transition for the drawer effect
const smoothTransition = {
  duration: 0.5,
  ease: [0.25, 1, 0.5, 1],
};

const RequestsPreview: React.FC = () => {
  const { id, paragraphId } = useParams<{ id: string; paragraphId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  const currentUserId = currentUser?.id;

  // Local states
  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localDislikes, setLocalDislikes] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Layout State
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: paragraphData,
    loading: paragraphLoading,
    error: paragraphError,
  } = useGetParagraphByIdQuery({
    variables: { paragraphId: paragraphId || "" },
    skip: !paragraphId,
    fetchPolicy: "cache-and-network",
  });

  const paragraph = paragraphData?.getParagraphById;
  const scriptId = paragraph?.script?.id;

  const { data: scriptData, loading: scriptLoading } = useGetScriptByIdQuery({
    variables: { id: scriptId || "" },
    skip: !scriptId,
    fetchPolicy: "cache-first",
  });

  const approvedParagraphs = scriptData?.getScriptById?.paragraphs || [];
  const scriptOwnerId = paragraph?.script?.author?.id;

  // Permissions
  const isOwner = currentUserId == scriptOwnerId;
  const isAuthor = currentUserId === paragraph?.author?.id;

  // Mutations
  const [approveParagraph, { loading: isApproving }] =
    useApproveParagraphMutation();
  const [rejectParagraph, { loading: isRejecting }] =
    useRejectParagraphMutation();
  const [likeParagraph] = useLikeParagraphMutation();
  const [dislikeParagraph] = useDislikeParagraphMutation();
  const [editParagraph, { loading: isEditingLoading }] =
    useEditParagraphMutation();
  const [deleteParagraph, { loading: isDeleting }] =
    useDeleteParagraphMutation();

  useEffect(() => {
    if (paragraph) {
      setLocalLikes((paragraph.likes as string[]) || []);
      setLocalDislikes((paragraph.dislikes as string[]) || []);
      setEditText(paragraph.text);
    }
  }, [paragraph]);

  // Magic auto-resize effect AND Cursor Placement for editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [editText, isEditing]);

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(Number(timestamp)));
  };

  const handleApprove = async () => {
    try {
      await approveParagraph({ variables: { paragraphId: paragraphId || "" } });
      navigate(`/requests/${scriptId}`);
    } catch (err) {
      console.error("Failed to approve:", err);
      alert("Failed to approve contribution.");
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this contribution?"))
      return;
    try {
      await rejectParagraph({ variables: { paragraphId: paragraphId || "" } });
      navigate(`/requests/${scriptId}`);
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject contribution.");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to completely delete this request?",
      )
    )
      return;
    try {
      await deleteParagraph({ variables: { paragraphId: paragraphId || "" } });
      navigate(`/requests/${scriptId}`);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete contribution.");
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    try {
      await editParagraph({
        variables: { paragraphId: paragraphId || "", text: editText },
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit:", err);
      alert("Failed to save changes.");
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return alert("Please log in.");
    const isLiked = localLikes.includes(currentUserId);
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

    if (isLiked) {
      setLocalLikes(prevLikes.filter((uid) => uid !== currentUserId));
    } else {
      setLocalLikes([...prevLikes, currentUserId]);
      setLocalDislikes(prevDislikes.filter((uid) => uid !== currentUserId));
    }
    try {
      await likeParagraph({ variables: { paragraphId: paragraphId || "" } });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return alert("Please log in.");
    const isDisliked = localDislikes.includes(currentUserId);
    const prevLikes = [...localLikes];
    const prevDislikes = [...localDislikes];

    if (isDisliked) {
      setLocalDislikes(prevDislikes.filter((uid) => uid !== currentUserId));
    } else {
      setLocalDislikes([...prevDislikes, currentUserId]);
      setLocalLikes(prevLikes.filter((uid) => uid !== currentUserId));
    }
    try {
      await dislikeParagraph({ variables: { paragraphId: paragraphId || "" } });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {paragraphLoading || scriptLoading ? (
        <motion.div
          key="loader"
          className="flex items-center justify-center w-full h-[60vh]"
        >
          <Loader />
        </motion.div>
      ) : paragraphError || !paragraph ? (
        <motion.div
          key="error"
          className="flex items-center justify-center w-full h-[60vh] text-center text-red-500 font-mono"
        >
          Failed to load contribution.
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-full max-w-7xl mx-auto flex flex-col font-mono h-[calc(100vh-64px)] overflow-hidden pb-4`}
        >
          {/* Top Navbar */}
          <div className="flex items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-full"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="font-bold font-sans text-2xl text-gray-200">
                Request
              </div>
            </div>
            {isOwner && paragraph?.status === "pending" && !isEditing && (
              <div className="flex justify-end gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReject}
                  disabled={isRejecting || isApproving}
                  className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 bg-white/10 text-gray-200 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  {isApproving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}{" "}
                  Approve
                </button>
              </div>
            )}
          </div>
          <hr className="border-b border-white/5 mb-4 shrink-0" />

          {/* 🚨 MASTER FLEX CONTAINER 🚨 */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative gap-2">
            {/* SECTION 1: Approved Context (Hides when discussion opens) */}
            <AnimatePresence initial={false}>
              {!isDiscussionOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginBottom: "0.5rem",
                  }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={smoothTransition}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="flex flex-col bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-y-auto max-h-[30vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 p-6">
                    {approvedParagraphs.length > 0 ? (
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300">
                        {approvedParagraphs.map((para) => (
                          <ReactMarkdown
                            key={para.id}
                            remarkPlugins={[remarkGfm]}
                          >
                            {para.text}
                          </ReactMarkdown>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500 italic font-mono">
                        <FileText className="w-4 h-4" /> This draft currently
                        has no approved content.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SECTION 2: The Pending Request Box (Shrinks when discussion opens) */}
            <motion.div
              animate={{
                flex: isDiscussionOpen ? "0 0 25%" : "1 1 auto",
              }}
              transition={smoothTransition}
              className="flex flex-col min-h-0 bg-[#0A0A12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                <div className="grid w-full relative items-start">
                  <AnimatePresence>
                    {!isEditing && (
                      <motion.div
                        key="markdown-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: "none" }}
                        transition={{ duration: 0.3 }}
                        className="col-start-1 row-start-1 text-white font-medium w-full text-[0.875rem] md:text-base leading-[1.7142857] md:leading-[1.75] whitespace-pre-wrap"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ children }) => (
                              <ul className="list-disc ml-5 m-0 p-0">
                                {children}
                              </ul>
                            ),
                            p: ({ children }) => (
                              <p className="m-0 p-0">{children}</p>
                            ),
                          }}
                        >
                          {paragraph?.text}
                        </ReactMarkdown>
                      </motion.div>
                    )}
                    {isEditing && (
                      <motion.div
                        key="textarea-edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: "none" }}
                        transition={{ duration: 0.3 }}
                        className="col-start-1 row-start-1 w-full"
                      >
                        <textarea
                          ref={textareaRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-transparent text-white border-none p-0 m-0 focus:outline-none focus:ring-0 resize-none overflow-hidden font-medium text-[0.875rem] md:text-base leading-[1.7142857] md:leading-[1.75] placeholder-gray-600 caret-amber-500 block"
                          placeholder="Edit your contribution..."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Footer */}
              <div className="shrink-0 border-t border-white/10 p-4 bg-black/20">
                <div className="flex items-center justify-between gap-3 text-gray-400 text-sm font-mono">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                      {paragraph?.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg leading-tight">
                        {paragraph?.author.username}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {formatDate(paragraph?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditText(paragraph?.text || "");
                            setIsEditing(false);
                          }}
                          className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSubmit}
                          disabled={isEditingLoading || !editText.trim()}
                          className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                        >
                          {isEditingLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleLike}
                          className="flex items-center gap-1.5 hover:text-white p-2 bg-white/5 rounded-lg border border-white/10 transition-colors"
                        >
                          <ThumbsUp
                            size={18}
                            className={
                              localLikes.includes(currentUserId || "")
                                ? "text-white fill-current"
                                : ""
                            }
                          />{" "}
                          <span>{localLikes.length}</span>
                        </button>
                        <button
                          onClick={handleDislike}
                          className="flex items-center gap-1.5 hover:text-white p-2 bg-white/5 rounded-lg border border-white/10 transition-colors"
                        >
                          <ThumbsDown
                            size={18}
                            className={
                              localDislikes.includes(currentUserId || "")
                                ? "text-white fill-current"
                                : ""
                            }
                          />{" "}
                          <span>{localDislikes.length}</span>
                        </button>

                        {/* Note: Comment button removed from here */}

                        {(isAuthor || isOwner) &&
                          paragraph?.status === "pending" && (
                            <>
                              <div className="w-px h-6 bg-white/10 mx-1" />
                              <button
                                onClick={() => setIsEditing(true)}
                                className="hover:text-white p-2 bg-white/5 rounded-lg border border-white/10 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="hover:text-red-400 text-red-500/80 p-2 bg-white/5 rounded-lg border border-white/10 disabled:opacity-50 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* --- NEW: Interactive Collapsible Divider --- */}
            <button
              onClick={() => setIsDiscussionOpen(!isDiscussionOpen)}
              className="w-full shrink-0 flex flex-col items-center justify-center py-2 hover:bg-white/5 rounded-xl transition-colors group focus:outline-none"
            >
              <div className="flex items-center gap-3 text-gray-500 group-hover:text-amber-500 transition-colors font-mono text-sm uppercase tracking-widest font-bold">
                {isDiscussionOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronUp size={18} />
                )}
                <span>Discussion ({paragraph?.comments?.length || 0})</span>
                {isDiscussionOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronUp size={18} />
                )}
              </div>
              <div className="w-full max-w-[200px] h-[2px] bg-white/10 group-hover:bg-amber-500/30 mt-1 rounded-full transition-colors" />
            </button>

            {/* SECTION 3: Discussion Box (Expands to fill remaining height) */}
            <AnimatePresence initial={false}>
              {isDiscussionOpen && (
                <motion.div
                  initial={{ opacity: 0, flex: "0 0 0%" }}
                  animate={{ opacity: 1, flex: "1 1 0%" }}
                  exit={{ opacity: 0, flex: "0 0 0%" }}
                  transition={smoothTransition}
                  className="flex flex-col min-h-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="h-full w-full flex flex-col p-4 md:p-6">
                    <DiscussionPanel
                      key="discussion-panel"
                      paragraphId={paragraphId || ""}
                      initialComments={paragraph?.comments || []}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RequestsPreview;
