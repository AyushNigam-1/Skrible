import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import {
  useGetParagraphByIdQuery,
  useGetScriptByIdQuery,
  useApproveParagraphMutation,
  useRejectParagraphMutation,
  useLikeParagraphMutation,
  useDislikeParagraphMutation,
  useDeleteParagraphMutation,
  useAddCommentMutation,
} from "../../graphql/generated/graphql";
import Loader from "../../components/layout/Loader";
import { useUserStore } from "../../store/useAuthStore";
import { posthog } from "../../components/providers/PostHogProvider";
import DiscussionPanel from "../../components/panel/DiscussionPanel";
import ContributeModal from "../../components/modal/ContributeModal";
import DeleteConfirmModal from "../../components/modal/DeleteConfirmModal";

const Contribution: React.FC = () => {
  const { id, paragraphId } = useParams<{ id: string; paragraphId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  const currentUserId = currentUser?.id;

  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localDislikes, setLocalDislikes] = useState<string[]>([]);
  const [isTargetSticky, setIsTargetSticky] = useState(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: paragraphData,
    loading: paragraphLoading,
    error: paragraphError,
    refetch,
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

  const isOwner = currentUserId == scriptOwnerId;
  const isAuthor = currentUserId === paragraph?.author?.id;

  const isTargetApproved = approvedParagraphs.some(
    (p) => p.id === paragraphId
  );

  const [approveParagraph, { loading: isApproving }] = useApproveParagraphMutation({
    refetchQueries: ["GetPendingParagraphs", "GetScriptById", "GetScriptContributors"]
  });

  const [rejectParagraph, { loading: isRejecting }] = useRejectParagraphMutation({
    refetchQueries: ["GetPendingParagraphs"]
  });

  const [deleteParagraph, { loading: isDeleting }] = useDeleteParagraphMutation({
    refetchQueries: ["GetPendingParagraphs"]
  });
  const [likeParagraph] = useLikeParagraphMutation();
  const [dislikeParagraph] = useDislikeParagraphMutation();
  const [addComment, { loading: isCommenting }] = useAddCommentMutation();

  useEffect(() => {
    if (paragraph) {
      setLocalLikes((paragraph.likes as string[]) || []);
      setLocalDislikes((paragraph.dislikes as string[]) || []);
      setLocalComments(paragraph.comments || []);
    }
  }, [paragraph]);

  useEffect(() => {
    if (paragraphId && paragraph) {
      const timer = setTimeout(() => {
        const el = document.getElementById("target-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [paragraphId, paragraph]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("target-card");
      if (el) {
        setIsTargetSticky(el.getBoundingClientRect().top <= 1);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      await approveParagraph({
        variables: { paragraphId: paragraphId || "" },
        refetchQueries: ["GetPendingParagraphs", "GetScriptById", "GetParagraphById"]
      });

      posthog.capture("contribution_approved", {
        paragraph_id: paragraphId,
        script_id: scriptId,
      });

      toast.success("Contribution approved successfully!"); // 🚨 Sonner
      await refetch();
      navigate(`/requests/${scriptId}`);
    } catch (err) {
      toast.error("Failed to approve contribution."); // 🚨 Sonner
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this contribution?"))
      return;
    try {
      await rejectParagraph({
        variables: { paragraphId: paragraphId || "" },
        refetchQueries: ["GetPendingParagraphs", "GetParagraphById"]
      });

      posthog.capture("contribution_rejected", {
        paragraph_id: paragraphId,
        script_id: scriptId,
      });

      toast.success("Contribution rejected."); // 🚨 Sonner
      await refetch();
      navigate(`/requests/${scriptId}`);
    } catch (err) {
      toast.error("Failed to reject contribution."); // 🚨 Sonner
    }
  };

  const handleDelete = async () => {
    try {
      await deleteParagraph({
        variables: { paragraphId: paragraphId || "" },
        refetchQueries: ["GetPendingParagraphs", "GetParagraphById"]
      });

      posthog.capture("contribution_deleted", {
        paragraph_id: paragraphId,
        script_id: scriptId,
      });

      toast.success("Contribution deleted."); // 🚨 Sonner
      setShowDeleteConfirm(false);
      navigate(`/requests/${scriptId}`);
    } catch (err) {
      toast.error("Failed to delete contribution."); // 🚨 Sonner
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return toast.error("Please log in to like this."); // 🚨 Sonner
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
      posthog.capture("contribution_liked", {
        paragraph_id: paragraphId,
        script_id: scriptId,
        toggled_off: isLiked,
      });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
      toast.error("Failed to update like status."); // 🚨 Sonner
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return toast.error("Please log in to dislike this."); // 🚨 Sonner
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
      posthog.capture("contribution_disliked", {
        paragraph_id: paragraphId,
        script_id: scriptId,
        toggled_off: isDisliked,
      });
    } catch (err) {
      setLocalLikes(prevLikes);
      setLocalDislikes(prevDislikes);
      toast.error("Failed to update dislike status."); // 🚨 Sonner
    }
  };

  const handleAddComment = async (submittedText: string) => {
    if (!currentUser) {
      toast.error("Please log in to comment."); // 🚨 Sonner
      return;
    }
    try {
      const newComment = {
        text: submittedText,
        createdAt: Date.now().toString(),
        author: { username: currentUser.name },
      };

      setLocalComments((prev) => [...prev, newComment]);

      await addComment({
        variables: { paragraphId: paragraphId || "", text: submittedText },
      });
      // Optional: toast.success("Comment posted!");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to post comment."); // 🚨 Sonner
      setLocalComments(paragraph?.comments || []);
    }
  };

  // --- REUSABLE TARGET CARD UI ---
  const renderTargetCard = () => (
    <div className="flex flex-col h-auto bg-white/5 border border-white/10 rounded-2xl relative shadow-2xl">
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#161620]/95 rounded-t-2xl transition-all duration-300">
        <div className="flex items-center">
          <AnimatePresence>
            {isTargetSticky && (
              <motion.div
                initial={{ opacity: 0, width: 0, marginRight: 0 }}
                animate={{ opacity: 1, width: 36, marginRight: 12 }}
                exit={{ opacity: 0, width: 0, marginRight: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden shrink-0 flex items-center"
              >
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors shrink-0 h-9 w-9"
                >
                  <ArrowLeft size={18} className="shrink-0" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0 ">
              {paragraph?.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-base leading-tight">
                {paragraph?.author.name}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {formatDate(paragraph?.createdAt)}
              </p>
            </div>
          </div>
        </div>
        {isOwner && paragraph?.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isRejecting || isApproving}
              className="flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-gray-300 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <XCircle size={18} />
              <span className="hidden sm:inline">Reject</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold transition-all hover:bg-white active:scale-95 disabled:opacity-50"
            >
              {isApproving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              <span className="hidden sm:inline">Approve</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 h-auto">
        <div className="grid w-full relative items-start">
          <div className="col-start-1 row-start-1 text-white font-medium w-full text-[0.875rem] md:text-base leading-[1.7142857] md:leading-[1.75] whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc ml-5 m-0 p-0">{children}</ul>
                ),
                p: ({ children }) => <p className="m-0 p-0">{children}</p>,
              }}
            >
              {paragraph?.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-white/5 z-30 p-4 bg-[#161620]/95 backdrop-blur-md rounded-b-2xl">
        <div className="flex flex-row items-center justify-between gap-4 text-gray-400 text-sm font-mono flex-wrap">
          <div className="flex items-center gap-2">
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

            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

            <button
              onClick={() => setIsDiscussionOpen(!isDiscussionOpen)}
              className={`flex items-center gap-1.5 p-2 rounded-lg border transition-colors ${isDiscussionOpen
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-white/5 hover:text-white border-white/10 text-gray-400"
                }`}
            >
              <MessageSquare size={18} />
              <span>{localComments.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {(isAuthor || isOwner) && paragraph?.status === "pending" && (
              <div className="flex items-center gap-2">
                <ContributeModal
                  mode="edit"
                  variant="edit"
                  paragraphId={paragraph.id}
                  initialTitle={paragraph?.text?.split('\n')[0]?.replace(/^#+\s*/, '') || ''}
                  initialContent={paragraph?.text?.split('\n')?.slice(1)?.join('\n')?.trim() || ''}
                  refetch={refetch}
                />
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="hover:text-red-400 text-red-500/80 p-2 bg-white/5 rounded-lg border border-white/10 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {paragraphLoading || scriptLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-full min-h-[96vh]"
        >
          <Loader />
        </motion.div>
      ) : paragraphError || !paragraph ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center w-full min-h-[80vh] text-center text-red-500 font-mono gap-4"
        >
          <XCircle className="w-10 h-10" />
          <p>Failed to load contribution.</p>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-7xl mx-auto flex font-mono relative"
        >
          <div
            className={`w-full flex flex-col transition-all duration-300 ease-in-out space-y-5`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-full"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="font-extrabold font-sans text-3xl text-gray-200">
                  Contribution
                </div>
              </div>
            </div>
            <motion.hr className="border-white/10" />
            {approvedParagraphs.length > 0 ? (
              <>
                {approvedParagraphs.reduce((acc: JSX.Element[], para, index, arr) => {
                  if (para.id === paragraphId) {
                    acc.push(
                      <div key={para.id} id="target-card" className="not-prose">
                        {renderTargetCard()}
                      </div>
                    );
                  } else {
                    const lastElement = acc[acc.length - 1];

                    if (lastElement && lastElement.props.className?.includes("connected-block")) {
                      const prevChildren = React.Children.toArray(lastElement.props.children);
                      acc[acc.length - 1] = React.cloneElement(lastElement, {}, [
                        ...prevChildren,
                        <div key={para.id} className="opacity-70">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{para.text}</ReactMarkdown>
                        </div>
                      ]);
                    } else {
                      acc.push(
                        <div key={`block-${para.id}`} className="connected-block flex flex-col bg-white/5 rounded-2xl border border-white/10  p-6 h-auto prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300">
                          <div key={para.id} className="opacity-70">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{para.text}</ReactMarkdown>
                          </div>
                        </div>
                      );
                    }
                  }
                  return acc;
                }, [])}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500 italic font-mono bg-white/5 rounded-2xl border border-white/10 p-6">
                <FileText className="w-4 h-4" /> This draft currently has no approved content.
              </div>
            )}

            {!isTargetApproved && paragraph && (
              <div id="target-card" className="">
                {renderTargetCard()}
              </div>
            )}
          </div>

          <DiscussionPanel
            isOpen={isDiscussionOpen}
            onClose={() => setIsDiscussionOpen(false)}
            isDesktop={isDesktop}
            comments={localComments}
            onAddComment={handleAddComment}
            isCommenting={isCommenting}
            formatDate={formatDate}
          />

          <DeleteConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
            title="Delete Request?"
            description="Are you sure you want to completely delete this request? This action cannot be undone."
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Contribution;