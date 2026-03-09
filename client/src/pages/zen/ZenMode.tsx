import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Pin, PinOff, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetScriptByIdQuery } from "../../graphql/generated/graphql";
import Loader from "../../components/layout/Loader";

const smoothTransition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1], // Custom iOS-like easing curve
};

const ZenMode = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isPinned, setIsPinned] = useState(false);

  const { data, loading } = useGetScriptByIdQuery({
    variables: { id: id || "" },
    skip: !id,
    fetchPolicy: "cache-first",
  });

  const script = data?.getScriptById;
  const paragraphs = script?.paragraphs || [];

  const handlePinClick = () => {
    setIsPinned(!isPinned);
  };

  return (
    // AnimatePresence is REQUIRED for exit animations to work between conditional renders
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-[96vh] flex-1 flex items-center justify-center"
        >
          <Loader />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={smoothTransition}
          className={`max-w-5xl mx-auto h-[calc(100vh-36px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-none transition-colors duration-500 rounded-2xl space-y-4 ${
            isPinned ? "cursor-crosshair" : "cursor-default"
          }`}
        >
          {/* --- Sticky Glass Header --- */}
          <div className="sticky top-0 z-50 flex justify-between items-center border-b border-white/5 pb-4 bg-[#0A0A14]">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-full text-gray-500 hover:bg-white/5 hover:text-white transition-all"
              title="Exit Zen Mode"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, ...smoothTransition }}
              className="text-gray-300 font-bold text-lg tracking-widest uppercase font-mono select-none"
            >
              {script?.title || "Untitled Draft"}
            </motion.h4>

            <button
              onClick={handlePinClick}
              className={`p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/30 ${
                isPinned
                  ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "text-gray-500 hover:bg-white/5 hover:text-white"
              }`}
              title={isPinned ? "Unpin" : "Pin Content"}
            >
              {isPinned ? (
                <PinOff className="w-5 h-5" />
              ) : (
                <Pin className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* --- Reading Area --- */}
          <div id="zen-content" className="w-full">
            {paragraphs.length > 0 ? (
              <div className="prose prose-lg dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold text-gray-300 text-xl">
                {paragraphs.map((para: any) => (
                  <motion.div
                    key={para.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, ...smoothTransition }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({ children }) => (
                          <ul className="list-disc ml-5 mb-8">{children}</ul>
                        ),
                        p: ({ children }) => <p className="mb-8">{children}</p>,
                      }}
                    >
                      {para.text}
                    </ReactMarkdown>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, ...smoothTransition }}
                className="flex flex-col items-center justify-center h-full text-center opacity-70 font-mono min-h-[50vh]"
              >
                <FileText className="w-12 h-12 text-gray-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-400 mb-2 tracking-widest uppercase">
                  A blank canvas
                </h3>
                <p className="text-gray-600 max-w-sm text-sm mx-auto">
                  There are no approved contributions to read yet. Exit Zen Mode
                  to start drafting.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ZenMode;
