import React from "react";
import { useQuery } from "@apollo/client";
import { Link, useOutletContext } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Inbox, Clock, User, FileText } from "lucide-react";

import RequestsSidebar from "../../components/RequestsSidebar";
import useElementHeight from "../../hooks/useElementOffset";
import useAutoScroll from "../../hooks/useAutoScroll";
import { GET_PENDING_PARAGRAPHS } from "../../graphql/query/paragraphQueries";

const Requests = () => {
  const { request, setRequest, data, refetch, setTab } = useOutletContext();
  const scriptId = data?.getScriptById?.id;

  const { data: pendingData, refetch: refetchPending } = useQuery(
    GET_PENDING_PARAGRAPHS,
    {
      variables: { scriptId },
      skip: !scriptId,
    },
  );

  const pendingParagraphs = pendingData?.getPendingParagraphs || [];
  const containerRef = useAutoScroll([data?.getScriptById?.paragraphs]);

  const calculatedHeight = useElementHeight("requests");
  const height = calculatedHeight || "70vh";

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(Number(timestamp)));
  };

  return (
    <div className="w-full" id="requests">
      {pendingParagraphs.length === 0 ? (
        /* --- EMPTY STATE (SLEEK MONOCHROME) --- */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-[#130f1c]/50 backdrop-blur-xl shadow-lg relative overflow-hidden animate-in fade-in duration-500">
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
        </div>
      ) : (
        /* --- MAIN LAYOUT --- */
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full pb-6 animate-in fade-in duration-500">
          {/* Sidebar Container */}
          <div className="lg:col-span-4 xl:col-span-3 h-[40vh] lg:h-full overflow-hidden bg-[#130f1c]/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
            <RequestsSidebar
              requests={pendingParagraphs}
              setRequest={setRequest}
              request={request}
              scriptId={scriptId}
              refetch={() => {
                refetch();
                refetchPending();
              }}
              setTab={setTab}
            />
          </div>

          {/* Preview Area */}
          <div
            id="requestPreview"
            ref={containerRef}
            className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 bg-[#130f1c]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 scrollbar-thumb-rounded-full"
          >
            {/* 1. Approved Draft Context */}
            {data?.getScriptById?.paragraphs?.length > 0 ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-300 leading-relaxed font-['Literata']">
                {data.getScriptById.paragraphs.map((para) => (
                  <ReactMarkdown
                    key={para.id}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ children }) => (
                        <ul className="list-disc ml-5 mb-4">{children}</ul>
                      ),
                      p: ({ children }) => <p className="mb-4">{children}</p>,
                    }}
                  >
                    {para.text}
                  </ReactMarkdown>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500 italic pb-4 border-b border-white/10 font-mono">
                <FileText className="w-4 h-4" />
                This draft currently has no approved content.
              </div>
            )}

            {/* 2. Selected Pending Contribution Highlight */}
            {request && (
              <div className="relative mt-2 shrink-0">
                {/* Sleek transparent dashed border */}
                <div className="absolute inset-0 bg-white/5 border border-dashed border-white/20 rounded-xl pointer-events-none" />

                <div
                  className="block relative z-10 p-5 cursor-pointer group hover:bg-white/5 transition-colors rounded-xl"
                  title="Reviewing this contribution"
                >
                  {/* Request Meta Header */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-white/10">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/20 text-white text-[10px] font-bold rounded-md uppercase tracking-widest shadow-sm font-mono">
                      <Clock className="w-3.5 h-3.5" /> Pending Addition
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                      <div className="bg-white/10 p-1.5 rounded-full">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      @{request.author?.username || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 ml-auto font-mono uppercase tracking-wider">
                      {formatDate(request.createdAt)}
                    </div>
                  </div>

                  {/* Pending Text Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-200 transition-colors font-['Literata'] leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({ children }) => (
                          <ul className="list-disc ml-5 mb-2">{children}</ul>
                        ),
                        p: ({ children }) => <p className="mb-0">{children}</p>,
                      }}
                    >
                      {request.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
