import React, { useEffect, useState } from "react";
import { APPROVE_PARAGRAPH } from "../graphql/mutation/scriptMutations";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle, Loader2, User } from "lucide-react";

const RequestsSidebar = ({
  requests = [],
  setRequest,
  request,
  scriptId,
  refetch,
}) => {
  const nav = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState(requests);
  const [approveParagraph, { loading }] = useMutation(APPROVE_PARAGRAPH);
  const [activeId, setActiveId] = useState(null);

  // Keep filtered list updated when search or requests change
  useEffect(() => {
    setFiltered(
      requests.filter((p) =>
        p.author.username.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, requests]);

  // Format the date nicely
  function formatFancyDate(timestamp) {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const handleApprove = async (e, paragraphId) => {
    e.stopPropagation(); // Prevents the card click event from firing
    setActiveId(paragraphId);

    try {
      await approveParagraph({
        variables: { paragraphId },
      });

      await refetch();

      // Clear the selected request if we just approved it
      if (request?.id === paragraphId) {
        setRequest(null);
      }

      // Optional: jump back to script view
      // nav(`/paragraphs/${scriptId}#${paragraphId}`);
    } catch (err) {
      console.error("Error approving request:", err);
      setActiveId(null);
    }
  };

  return (
    // APPLIED INTER TO SIDEBAR FOR CRISP UI TEXT
    <div className="flex flex-col h-full w-full p-4 gap-4 font-['Inter']">
      {/* --- Search Bar (GLASSMORPHISM) --- */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search authors..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- Pending Paragraphs List --- */}
      {/* UPDATED SCROLLBAR FOR GLASS THEME */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 dark:scrollbar-thumb-white/20">
        {filtered.length > 0 ? (
          filtered.map((p) => {
            const isSelected = request?.id === p.id;

            return (
              <div
                key={p.id}
                onClick={() => setRequest(p)}
                // APPLIED GLASSMORPHISM TO CARDS & SELECTED STATES
                className={`group flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border backdrop-blur-sm shadow-sm ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500/30"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Author Avatar */}
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${isSelected ? "from-blue-500 to-indigo-600 shadow-md" : "from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700"}`}
                  >
                    {p.author.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col overflow-hidden">
                    <h6
                      className={`font-semibold text-sm truncate ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-900 dark:text-gray-100"}`}
                    >
                      {p.author.username}
                    </h6>
                    <p
                      className={`text-xs font-medium truncate ${isSelected ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`}
                    >
                      {formatFancyDate(p.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Approve Button */}
                <button
                  onClick={(e) => handleApprove(e, p.id)}
                  disabled={activeId === p.id && loading}
                  title="Approve Contribution"
                  // UPDATED HOVER STATES TO TRANSLUCENT COLORS
                  className={`p-2 rounded-lg transition-colors shrink-0 ml-2 ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                      : "text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {activeId === p.id && loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "No authors match your search"
                : "No pending contributions"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsSidebar;
