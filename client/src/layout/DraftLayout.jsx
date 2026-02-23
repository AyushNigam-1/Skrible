import React, { useEffect, useState } from "react";
import { useParams, Outlet, useOutletContext } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_SCRIPT_BY_ID } from "../graphql/query/scriptQueries";
import Tabs from "../components/Tabs";
import Loader from "../components/Loader";
import { User, Tag, Globe, Calendar, Lock, Globe2 } from "lucide-react";

const DraftLayout = () => {
    const { id } = useParams();
    const { path } = useOutletContext();
    const [cursorClass, setCursorClass] = useState("cursor-default");
    const [request, setRequest] = useState(null);
    const [tab, setTab] = useState("Script");

    const { data, loading, error, refetch } = useQuery(GET_SCRIPT_BY_ID, {
        variables: { id },
        skip: !id,
    });

    useEffect(() => {
        if (!request && data?.getScriptById?.requests) {
            setRequest(data?.getScriptById?.requests[0]);
        }
    }, [data, request]);

    if (error) return <div className="p-4 text-red-500">Error: {JSON.stringify(error)}</div>;

    const script = data?.getScriptById;

    // Format the creation date
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(new Date(Number(timestamp)));
    };

    return (
        <div className={`relative ${path === 'zen' ? 'w-full' : `flex flex-col gap-6 w-full max-w-6xl mx-auto ${cursorClass}`}`}>

            {/* --- SCRIPT DETAILS HEADER --- */}
            {path !== 'zen' && script && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 ">

                    {/* Title and Visibility Badge */}
                    <div className="flex justify-between items-start gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {script.title}
                        </h1>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${script.visibility === 'Public'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            }`}>
                            {script.visibility === 'Public' ? <Globe2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {script.visibility}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-3xl">
                        {script.description || "No description provided for this draft."}
                    </p>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Meta Info (Author, Genres, Languages, Date) */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-gray-900 dark:text-gray-200">@{script.author?.username}</span>
                        </div>

                        {script.genres?.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-400" />
                                <span>{script.genres.join(", ")}</span>
                            </div>
                        )}

                        {script.languages?.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span>{script.languages.join(", ")}</span>
                            </div>
                        )}

                        {script.createdAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>Created {formatDate(script.createdAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- STICKY TABS --- */}
            {path !== 'zen' && (
                <div className="sticky top-0 z-20 pt-2 pb-2 bg-[#f3f4f6]/90 dark:bg-[#0f172a]/90 backdrop-blur-md rounded-b-xl -mx-2 px-2">
                    <Tabs setTab={setTab} tab={tab} scriptId={id} />
                </div>
            )}

            {/* --- CONTENT OUTLET --- */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader />
                </div>
            ) : (
                <div className="w-full relative z-10">
                    <Outlet context={{ request, setRequest, data, refetch, setTab, tab, loading }} />
                </div>
            )}
        </div>
    );
};

export default DraftLayout;