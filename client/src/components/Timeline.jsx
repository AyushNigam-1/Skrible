import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Loader from "./Loader";
import { useLazyQuery } from "@apollo/client";
import { EXPORT_DOCUMENT_QUERY } from "../graphql/query/paragraphQueries";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";
import Search from "./Search";
import ContributeModal from "./modal/ContributeModal";

const Timeline = () => {
  const nav = useNavigate();
  const { data, refetch, loading } = useOutletContext();
  const [isDownloading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);

  if (loading) return <Loader />;

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const paragraphs = [...(data?.getScriptById.paragraphs || [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const groupedParagraphs = paragraphs.reduce((groups, paragraph) => {
    const date = formatter.format(new Date(Number(paragraph.createdAt)));
    (groups[date] ||= []).push(paragraph);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedParagraphs);

  return (
    <div className="flex flex-col gap-6 w-full mx-auto pb-10 font-mono">
      {/* --- Empty State --- */}
      {paragraphs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 relative overflow-hidden">
          <div className="bg-white/10 border border-white/20 p-4 rounded-full shadow-sm relative z-10">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-['Playfair_Display'] relative z-10">
            No contributions yet
          </h3>
          <p className="text-gray-400 max-w-md mb-6 text-sm relative z-10">
            This draft is currently empty. Be the first to add content and shape
            the story!
          </p>

          {/* Drop in the Modal with the empty state button styling */}
          <ContributeModal
            scriptId={data?.getScriptById.id}
            combinedText={data?.getScriptById.combinedText}
            refetch={refetch}
            variant="empty"
          />
        </div>
      )}

      {/* --- Header with Contribute Button --- */}
      {paragraphs.length > 0 && (
        <div className="flex justify-between items-center">
          <Search
            setSearch={setSearchQuery}
            placeholder="Search contributors..."
          />

          {/* Drop in the Modal with the header button styling */}
          <ContributeModal
            scriptId={data?.getScriptById.id}
            combinedText={data?.getScriptById.combinedText}
            refetch={refetch}
            variant="header"
          />
        </div>
      )}

      <div className="flex flex-col gap-8">
        {sortedDates.map((date) => (
          <div key={date} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <hr className="flex-grow border-white/10" />
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider font-mono">
                {date}
              </h4>
              <hr className="flex-grow border-white/10" />
            </div>

            {groupedParagraphs[date].map((p) => (
              <Link
                key={p.id}
                to={`/contribution/${p.id}`}
                className="block bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-6 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold shadow-inner">
                    {p.author.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-mono text-sm font-bold text-white">
                    @{p.author.username}
                  </p>
                </div>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300 text-lg leading-relaxed font-['Literata']">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {p.text}
                  </ReactMarkdown>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
