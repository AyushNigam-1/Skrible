import React, { useEffect, useState } from "react";
import { APPROVE_PARAGRAPH } from "../graphql/mutation/scriptMutations";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle, Loader2, User } from "lucide-react";

const RequestsSidebar = ({ requests = [], setRequest, request, scriptId, refetch }) => {
    const nav = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [filtered, setFiltered] = useState(requests);
    const [approveParagraph, { loading }] = useMutation(APPROVE_PARAGRAPH);
    const [activeId, setActiveId] = useState(null);

    // Keep filtered list updated when search or requests change
    useEffect(() => {
        setFiltered(
            requests.filter((p) =>
                p.author.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
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
        <div className="flex flex-col h-full w-full p-4 gap-4">

            {/* --- Search Bar --- */}
            <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search authors..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- Pending Paragraphs List --- */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                {filtered.length > 0 ? (
                    filtered.map((p) => {
                        const isSelected = request?.id === p.id;

                        return (
                            <div
                                key={p.id}
                                onClick={() => setRequest(p)}
                                className={`group flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-700"
                                    : "bg-white border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* Author Avatar Placeholder */}
                                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${isSelected ? 'from-blue-500 to-indigo-600' : 'from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700'}`}>
                                        {p.author.username.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex flex-col overflow-hidden">
                                        <h6 className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-200'}`}>
                                            {p.author.username}
                                        </h6>
                                        <p className={`text-xs truncate ${isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {formatFancyDate(p.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Approve Button */}
                                <button
                                    onClick={(e) => handleApprove(e, p.id)}
                                    disabled={activeId === p.id && loading}
                                    title="Approve Contribution"
                                    className={`p-2 rounded-lg transition-colors shrink-0 ml-2 ${isSelected
                                        ? "text-blue-600 hover:bg-blue-200/50 dark:text-blue-400 dark:hover:bg-blue-800/50"
                                        : "text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/30"
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
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {searchTerm ? "No authors match your search" : "No pending contributions"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestsSidebar;