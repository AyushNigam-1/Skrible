import React from "react";
import { useQuery } from "@apollo/client";
import { useOutletContext, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Inbox,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import Loader from "../../components/layout/Loader";
import { GET_PENDING_PARAGRAPHS } from "../../graphql/query/paragraphQueries";

type Paragraph = {
  id: string;
  text: string;
};

type Author = {
  username?: string;
};

type RequestType = {
  id?: string;
  text: string;
  createdAt?: string | number;
  author?: Author;
  likes?: string[];
  dislikes?: string[];
  comments?: any[];
};

type ScriptData = {
  getScriptById?: {
    id: string;
    paragraphs: Paragraph[];
  };
};

type PendingData = {
  getPendingParagraphs: RequestType[];
};

type OutletContextType = {
  request: RequestType | null;
  setRequest: (req: RequestType | null) => void;
  data: ScriptData;
  refetch: () => void;
  setTab: (tab: string) => void;
};

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const { data, refetch } = useOutletContext<OutletContextType>();

  const scriptId = data?.getScriptById?.id;

  const { data: pendingData, loading } = useQuery<PendingData>(
    GET_PENDING_PARAGRAPHS,
    {
      variables: { scriptId },
      skip: !scriptId,
    },
  );

  const pendingParagraphs = pendingData?.getPendingParagraphs || [];

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(Number(timestamp)));
  };

  // Animation variants
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full flex-1 flex flex-col" id="requests">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full min-h-[60vh]"
          >
            <Loader />
          </motion.div>
        ) : pendingParagraphs.length === 0 ? (
          <motion.div
            key="empty-state"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-[#130f1c]/50 backdrop-blur-xl shadow-lg relative overflow-hidden max-w-3xl mx-auto w-full "
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="bg-white/10 border border-white/20 p-4 rounded-full mb-5 shadow-sm relative z-10">
              <Inbox className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 relative z-10">
              No pending contributions
            </h3>

            <p className="text-gray-400 max-w-md text-sm relative z-10">
              There are currently no open requests. Wait for collaborators to
              propose new additions to this draft!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-6"
          >
            {pendingParagraphs.map((req) => (
              <motion.div
                key={req.id}
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/preview/${scriptId}/${req.id}`)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold shadow-inner border border-white/10">
                    {req.author?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white font-mono">
                      {req.author?.username || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-400 font-mono">
                      {formatDate(req.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-400 line-clamp-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ children }) => (
                        <ul className="list-disc ml-5 mb-2">{children}</ul>
                      ),
                      p: ({ children }) => <p className="mb-0">{children}</p>,
                    }}
                  >
                    {req.text}
                  </ReactMarkdown>
                </div>

                <div className="flex items-center justify-between gap-6  text-gray-400 text-sm font-mono">
                  <div className="flex items-center gap-6 ">
                    <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{req.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                      <ThumbsDown className="w-4 h-4" />
                      <span>{req.dislikes?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{req.comments?.length || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Requests;
