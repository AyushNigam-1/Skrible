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
        }
    );

    const pendingParagraphs = pendingData?.getPendingParagraphs || [];
    const containerRef = useAutoScroll([data?.getScriptById?.paragraphs]);

    const calculatedHeight = useElementHeight("requests");
    const height = calculatedHeight || "70vh";

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }).format(new Date(Number(timestamp)));
    };

    return (
        // APPLIED INTER TO THE OUTER WRAPPER FOR CRISP UI
        <div className="w-full font-['Inter']" id="requests" >
            {pendingParagraphs.length === 0 ? (
                /* --- EMPTY STATE (GLASSMORPHISM) --- */
                <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl shadow-lg p-6 mx-2">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-5 shadow-sm">
                        <Inbox className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        No pending contributions
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 max-w-md">
                        There are currently no open requests. Wait for collaborators to propose new additions to this draft!
                    </p>
                </div>
            ) : (
                /* --- MAIN LAYOUT --- */
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full pb-6">

                    {/* Sidebar Container (GLASSMORPHISM) */}
                    <div className="lg:col-span-4 xl:col-span-3 h-[40vh] lg:h-full overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
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

                    {/* Preview Area (GLASSMORPHISM) */}
                    <div
                        id="requestPreview"
                        ref={containerRef}
                        className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-lg overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 dark:scrollbar-thumb-white/20 scrollbar-thumb-rounded-full"
                    >

                        {/* 1. Approved Draft Context */}
                        {data?.getScriptById?.paragraphs?.length > 0 ? (
                            // APPLIED LITERATA FOR DRAFT CONTENT
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-['Literata'] text-lg">
                                {data.getScriptById.paragraphs.map((para) => (
                                    <ReactMarkdown
                                        key={para.id}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            ul: ({ children }) => <ul className="list-disc ml-5 mb-4">{children}</ul>,
                                            p: ({ children }) => <p className="mb-4">{children}</p>
                                        }}
                                    >
                                        {para.text}
                                    </ReactMarkdown>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 italic pb-4 border-b border-white/10">
                                <FileText className="w-4 h-4" />
                                This draft currently has no approved content.
                            </div>
                        )}

                        {/* 2. Selected Pending Contribution Highlight */}
                        {request && (
                            <div className="relative mt-4 shrink-0">
                                {/* Decorative dashed border background tuned for Glassmorphism */}
                                <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400/30 rounded-xl pointer-events-none" />

                                <div
                                    className="block relative z-10 p-5 md:p-6 cursor-pointer group hover:bg-white/5 transition-colors rounded-xl"
                                    title="Reviewing this contribution"
                                >
                                    {/* Request Meta Header (Uses Inter) */}
                                    <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-white/10">
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">
                                            <Clock className="w-3.5 h-3.5" /> Pending Addition
                                        </span>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                            <div className="bg-white/10 p-1.5 rounded-full">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            {request.author?.username || "Unknown Author"}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 ml-auto font-medium">
                                            {formatDate(request.createdAt)}
                                        </div>
                                    </div>

                                    {/* Pending Text Content (APPLIED LITERATA) */}
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-900 dark:text-white transition-colors font-['Literata'] text-lg">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                ul: ({ children }) => <ul className="list-disc ml-5 mb-2">{children}</ul>,
                                                p: ({ children }) => <p className="mb-0">{children}</p>
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