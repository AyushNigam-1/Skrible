import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Pin, PinOff, FileText } from "lucide-react";

const ZenMode = () => {
  const navigate = useNavigate();
  const { data } = useOutletContext();
  const [isPinned, setIsPinned] = useState(false);

  const script = data?.getScriptById;
  const paragraphs = script?.paragraphs || [];

  const handlePinClick = () => {
    setIsPinned(!isPinned);
  };

  return (
    <div
      className={`flex flex-col w-full h-full  transition-colors duration-500 rounded-2xl animate-in fade-in duration-700 ${isPinned ? "cursor-crosshair" : "cursor-default"}`}
    >
      {/* --- Unobtrusive Header --- */}
      <div className="flex justify-between items-center pb-3  border-b border-white/10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-full text-gray-500 hover:bg-white/5 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
          title="Exit Zen Mode"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <h4 className="text-gray-400 font-bold text-lg tracking-widest uppercase font-mono select-none ">
          {script?.title || "Untitled Draft"}
        </h4>

        {/* Pin Button */}
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
      <div
        id="zen-content"
        className="w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-thumb-rounded-full px-6 py-12 md:py-20"
      >
        {paragraphs.length > 0 ? (
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold text-gray-300 text-xl">
            {paragraphs.map((para) => (
              <ReactMarkdown
                key={para.id}
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
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center opacity-70 font-mono">
            <FileText className="w-12 h-12 text-gray-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-400 mb-2 tracking-widest uppercase">
              A blank canvas
            </h3>
            <p className="text-gray-600 max-w-sm text-sm">
              There are no approved contributions to read yet. Exit Zen Mode to
              start drafting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZenMode;
