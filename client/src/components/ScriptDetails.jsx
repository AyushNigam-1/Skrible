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
            // APPLIED INTER FOR UI ELEMENTS & SCROLLBAR REFINEMENT
            className="w-full mx-auto overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 dark:scrollbar-thumb-white/20 scrollbar-thumb-rounded-full pb-10 font-['Inter']"
        >
            <div className="flex flex-col gap-6">

                {/* --- Synopsis / Description Card (GLASSMORPHISM) --- */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-white/10 pb-3">
                        <AlignLeft className="w-5 h-5 text-blue-500" />
                        Synopsis
                    </h3>
                    {/* APPLIED LITERATA FOR READING CONTENT */}
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-xl font-['Literata']">
                        {script?.description || "No description provided for this draft."}
                    </p>
                </div>

                {/* --- Metadata Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Author */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">Original Author</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                @{script?.author?.username}
                            </p>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">Created On</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatDate(script?.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300">
                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-green-600 dark:text-green-400 shrink-0 shadow-sm">
                            {script?.visibility === 'Public' ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">Visibility</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {script?.visibility}
                            </p>
                        </div>
                    </div>

                    {/* Total Contributions */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300">
                        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-purple-600 dark:text-purple-400 shrink-0 shadow-sm">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">Approved Contributions</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {script?.paragraphs?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Classification / Tags (GLASSMORPHISM) --- */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-6">

                    {/* Genres */}
                    <div>
                        <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 dark:text-white mb-3">
                            <Tags className="w-4 h-4 text-gray-500" />
                            Genres
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {script?.genres?.length > 0 ? (
                                script.genres.map((genre, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold border border-white/10 shadow-sm">
                                        # {genre}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic text-sm">No genres specified</span>
                            )}
                        </div>
                    </div>

                    <hr className="border-white/10" />

                    {/* Languages */}
                    <div>
                        <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 dark:text-white mb-3">
                            <Languages className="w-4 h-4 text-gray-500" />
                            Languages
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {script?.languages?.length > 0 ? (
                                script.languages.map((language, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold border border-blue-500/20 shadow-sm">
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