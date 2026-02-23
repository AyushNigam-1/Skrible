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

    // Fallback height if the hook returns undefined temporarily
    const calculatedHeight = useElementHeight("requests");
    const height = calculatedHeight || "70vh";

    // Format timestamp helper
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }).format(new Date(Number(timestamp)));
    };

    return (
        <div className="w-full" id="requests" >
            {pendingParagraphs.length === 0 ? (
                /* --- EMPTY STATE --- */
                <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 p-6 mx-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full mb-5">
                        <Inbox className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        No pending contributions
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        There are currently no open requests. Wait for collaborators to propose new additions to this draft!
                    </p>
                </div>
            ) : (
                /* --- MAIN LAYOUT --- */
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full pb-6">

                    {/* Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3 h-[40vh] lg:h-full overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
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
                        className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-thumb-rounded-full"
                    >

                        {/* 1. Approved Draft Context */}
                        {data?.getScriptById?.paragraphs?.length > 0 ? (
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
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
                            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 italic pb-4 border-b border-gray-100 dark:border-gray-800">
                                <FileText className="w-4 h-4" />
                                This draft currently has no approved content.
                            </div>
                        )}

                        {/* 2. Selected Pending Contribution Highlight */}
                        {request && (
                            <div className="relative mt-4 shrink-0">
                                {/* Decorative dashed border background */}
                                <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-400 dark:border-blue-500/50 rounded-xl pointer-events-none" />

                                <Link
                                    className="block relative z-10 p-5 md:p-6 cursor-pointer group hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors rounded-xl"
                                    to={`/para/${request.id}`}
                                    state={{ contribution: request }}
                                    title="Click to review this contribution"
                                >
                                    {/* Request Meta Header */}
                                    <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-blue-200/50 dark:border-blue-800/50">
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white text-xs font-bold rounded-md uppercase tracking-wider">
                                            <Clock className="w-3.5 h-3.5" /> Pending Addition
                                        </span>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            {request.author?.username || "Unknown Author"}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                            {formatDate(request.createdAt)}
                                        </div>
                                    </div>

                                    {/* Pending Text Content */}
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
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

                                    <div className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                                        Click to Review &rarr;
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;