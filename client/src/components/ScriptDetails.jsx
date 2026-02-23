import React from 'react';
import { useOutletContext } from 'react-router-dom';
import useElementHeight from '../hooks/useElementOffset';
import {
    AlignLeft,
    User,
    Globe,
    Lock,
    Calendar,
    FileText,
    Languages,
    Tags,
    Info
} from 'lucide-react';
import Loader from './Loader';

const ScriptDetails = () => {
    const { data, loading } = useOutletContext();
    const height = useElementHeight('details');

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full" style={{ height: '70vh' }}>
                <Loader />
            </div>
        );
    }

    const script = data?.getScriptById;

    const formatDate = (isoString) => {
        if (!isoString) return "Unknown Date";
        const date = new Date(Number(isoString));
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    };

    return (
        <div
            id="details"
            style={{ height: height || '75vh' }}
            className="w-full mx-auto overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-thumb-rounded-full pb-10"
        >
            <div className="flex flex-col gap-6">

                {/* --- Synopsis / Description Card --- */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                        <AlignLeft className="w-5 h-5 text-blue-500" />
                        Synopsis
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {script?.description || "No description provided for this draft."}
                    </p>
                </div>

                {/* --- Metadata Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Author */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-200 dark:hover:border-gray-700 transition-colors">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Original Author</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                @{script?.author?.username}
                            </p>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-200 dark:hover:border-gray-700 transition-colors">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created On</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(script?.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-200 dark:hover:border-gray-700 transition-colors">
                        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400 shrink-0">
                            {script?.visibility === 'Public' ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Visibility</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {script?.visibility}
                            </p>
                        </div>
                    </div>

                    {/* Total Contributions */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-200 dark:hover:border-gray-700 transition-colors">
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Approved Contributions</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {script?.paragraphs?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Classification / Tags --- */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">

                    {/* Genres */}
                    <div>
                        <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 dark:text-white mb-3">
                            <Tags className="w-4 h-4 text-gray-400" />
                            Genres
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {script?.genres?.length > 0 ? (
                                script.genres.map((genre, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700">
                                        # {genre}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic text-sm">No genres specified</span>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Languages */}
                    <div>
                        <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 dark:text-white mb-3">
                            <Languages className="w-4 h-4 text-gray-400" />
                            Languages
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {script?.languages?.length > 0 ? (
                                script.languages.map((language, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/50">
                                        {language}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic text-sm">No languages specified</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ScriptDetails;