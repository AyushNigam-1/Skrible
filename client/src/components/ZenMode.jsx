import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useElementHeight from '../hooks/useElementOffset';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Pin, PinOff, FileText } from 'lucide-react';

const ZenMode = () => {
    const navigate = useNavigate();
    const { data } = useOutletContext();
    const [isPinned, setIsPinned] = useState(false);

    // Add fallback height in case the custom hook is still calculating
    const calculatedHeight = useElementHeight("zen-content");
    const height = calculatedHeight || "80vh";

    const script = data?.getScriptById;
    const paragraphs = script?.paragraphs || [];

    const handlePinClick = () => {
        setIsPinned(!isPinned);
        // Note: You can apply a custom cursor class here to the parent body/container if needed
    };

    return (
        <div className={`flex flex-col w-full h-full bg-white dark:bg-[#0b1120] transition-colors duration-500 rounded-2xl ${isPinned ? 'cursor-crosshair' : 'cursor-default'}`}>

            {/* --- Unobtrusive Header --- */}
            <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800/60'>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className='p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    title="Exit Zen Mode"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Title */}
                <h4 className="text-gray-900 dark:text-white font-black text-2xl tracking-tight opacity-90 select-none">
                    {script?.title || "Untitled Draft"}
                </h4>

                {/* Pin Button */}
                <button
                    onClick={handlePinClick}
                    className={`p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isPinned
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    title={isPinned ? "Unpin" : "Pin Content"}
                >
                    {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                </button>
            </div>

            {/* --- Reading Area --- */}
            <div
                id='zen-content'
                style={{ height }}
                className='w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-gray-700 scrollbar-thumb-rounded-full px-6 py-10'
            >
                {paragraphs.length > 0 ? (
                    <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold text-gray-800 dark:text-gray-300">
                        {paragraphs.map((para) => (
                            <ReactMarkdown
                                key={para.id}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    ul: ({ children }) => <ul className="list-disc ml-5 mb-6">{children}</ul>,
                                    p: ({ children }) => <p className="mb-6">{children}</p>
                                }}
                            >
                                {para.text}
                            </ReactMarkdown>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            A blank canvas
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            There are no approved contributions to read yet. Exit Zen Mode to start drafting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZenMode;