import React, { useEffect, useState } from "react";
import { APPROVE_PARAGRAPH } from "../graphql/mutation/scriptMutations";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const RequestsSidebar = ({ paragraphs, scriptId, refetch }) => {
    const nav = useNavigate();

    // paragraphs = pending paragraphs only (pass from parent)

    const [searchTerm, setSearchTerm] = useState("");
    const [filtered, setFiltered] = useState(paragraphs || []);
    const [approveParagraph, { loading }] = useMutation(APPROVE_PARAGRAPH);
    const [activeId, setActiveId] = useState(null);

    const handleApprove = async (paragraphId) => {
        setActiveId(paragraphId);

        try {
            await approveParagraph({
                variables: { paragraphId },
            });

            await refetch();

            // jump back to script view
            nav(`/paragraphs/${scriptId}#${paragraphId}`);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setFiltered(
            (paragraphs || []).filter((p) =>
                p.author.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, paragraphs]);

    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="col-span-3 bg-gray-200/50 p-2 rounded-xl flex flex-col gap-3">
            {/* Search */}
            <div className="flex gap-2 text-gray-400 rounded-lg bg-white p-2 items-center">
                <input
                    type="text"
                    placeholder="Search by author..."
                    className="text-lg bg-transparent w-full outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Pending paragraphs */}
            <div className="flex flex-col gap-3 overflow-auto h-full">
                {filtered.length ? (
                    filtered.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-lg p-2 flex justify-between items-center"
                        >
                            <div className="flex gap-2">
                                <img
                                    className="w-12 rounded-md"
                                    src="https://tecdn.b-cdn.net/img/new/avatars/2.webp"
                                    alt=""
                                />

                                <div>
                                    <h6 className="font-bold text-gray-800 text-lg">
                                        {p.author.username}
                                    </h6>
                                    <p className="text-sm text-gray-600">
                                        {formatFancyDate(p.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="bg-gray-200/50 rounded-lg p-2 text-gray-600"
                                onClick={() => handleApprove(p.id)}
                            >
                                {activeId === p.id && loading ? (
                                    <span className="animate-spin">⏳</span>
                                ) : (
                                    "✓"
                                )}
                            </button>
                        </div>
                    ))
                ) : (
                    <h6 className="text-center text-gray-600 font-semibold text-lg">
                        No pending contributions
                    </h6>
                )}
            </div>
        </div>
    );
};

export default RequestsSidebar;
