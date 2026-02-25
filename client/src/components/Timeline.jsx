import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Loader from "./Loader";
import { SUBMIT_PARAGRAPH } from "../graphql/mutation/scriptMutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Dialog, DialogPanel } from "@headlessui/react";
import { EXPORT_DOCUMENT_QUERY } from "../graphql/query/paragraphQueries";
import FileUpload from "./FileUpload";
import { diffChars } from "diff";
import { pdfjs } from "react-pdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, PlusCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Timeline = () => {
    const nav = useNavigate();
    const { data, refetch, loading } = useOutletContext();
    console.log(data)
    const [isDownloading, setLoading] = useState(false);
    const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [fileText, setFileText] = useState("");
    const [diffResult, setDiffResult] = useState(null);
    const [popover, setPopover] = useState(false);

    const [manualText, setManualText] = useState("");

    const [submitParagraph, { loading: isSubmitting }] = useMutation(SUBMIT_PARAGRAPH);

    const extractText = async (uploadedFiles) => {
        let extractedText = "";
        for (const file of uploadedFiles) {
            if (file.type === "text/plain" || file.name.endsWith(".md")) {
                extractedText += await readTextFile(file);
            } else if (file.type === "application/pdf") {
                extractedText += await readPdfFile(file);
            }
        }
        setFileText(extractedText);
        compareText(extractedText);
    };

    const handleFileChange = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(uploadedFiles);
        extractText(uploadedFiles);
    };

    const readTextFile = (file) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });

    const readPdfFile = (file) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjs.getDocument(typedArray).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((item) => item.str).join(" ") + " ";
                }
                resolve(text);
            };
            reader.readAsArrayBuffer(file);
        });

    const compareText = (uploadedText) => {
        const differences = diffChars(data?.getScriptById.combinedText || "", uploadedText);
        setDiffResult(differences);
    };

    const handleCreateContribution = async (textToSubmit) => {
        if (!textToSubmit.trim()) return alert("Contribution cannot be empty");

        try {
            await submitParagraph({
                variables: {
                    scriptId: data?.getScriptById.id,
                    text: textToSubmit,
                },
            });
            refetch();
            closeModal();
        } catch (error) {
            console.error("Error submitting contribution:", error);
            alert("Failed to submit. Please try again.");
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setManualText("");
        setDiffResult(null);
        setFiles([]);
    };

    const hasDiffAdditions = diffResult && diffResult.some(d => d.added);
    const canSubmit = manualText.trim().length > 0 || hasDiffAdditions;

    const handleSubmitClick = () => {
        if (manualText.trim()) {
            handleCreateContribution(manualText);
        } else if (hasDiffAdditions) {
            const addedText = diffResult.filter(d => d.added).map(d => d.value).join(" ");
            handleCreateContribution(addedText);
        }
    };

    if (loading) return <Loader />;

    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const paragraphs = [...(data?.getScriptById.paragraphs || [])].sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt)
    );

    const groupedParagraphs = paragraphs.reduce((groups, paragraph) => {
        const date = formatter.format(new Date(Number(paragraph.createdAt)));
        (groups[date] ||= []).push(paragraph);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedParagraphs);

    return (
        <div className="flex flex-col gap-6 w-full mx-auto pb-10">
            {/* Header with Contribute Button */}
            <div className="flex justify-between items-center">
                {/* APPLIED PLAYFAIR DISPLAY TO HEADER */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-['Playfair_Display']">Timeline</h2>
                {paragraphs.length > 0 && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Contribute
                    </button>
                )}
            </div>

            {/* EMPTY STATE */}
            {paragraphs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    {/* APPLIED PLAYFAIR DISPLAY */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-['Playfair_Display']">No contributions yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6 text-sm">
                        This draft is currently empty. Be the first to add content and shape the story!
                    </p>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Start Contributing
                    </button>
                </div>
            )}

            {/* Paragraphs List */}
            <div className="flex flex-col gap-8">
                {sortedDates.map((date) => (
                    <div key={date} className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <hr className="flex-grow border-gray-200 dark:border-gray-800" />
                            <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {date}
                            </h4>
                            <hr className="flex-grow border-gray-200 dark:border-gray-800" />
                        </div>

                        {groupedParagraphs[date].map((p) => (
                            <Link
                                key={p.id}
                                to={`/contribution/${p.id}`}
                                className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {p.author.username.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        {p.author.username}
                                    </p>
                                </div>
                                {/* APPLIED CRIMSON PRO TO DRAFT CONTENT */}
                                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 font-['Crimson_Pro'] text-lg leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.text}</ReactMarkdown>
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            {/* Contribution Modal */}
            <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[90vh]">
                        {/* APPLIED PLAYFAIR DISPLAY */}
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white font-['Playfair_Display']">Add Contribution</h3>

                        {/* Text Area for Direct Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Write your draft addition
                            </label>
                            {/* APPLIED CRIMSON PRO TO WRITING AREA */}
                            <textarea
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                rows={6}
                                disabled={files.length > 0}
                                className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 font-['Crimson_Pro'] text-lg leading-relaxed"
                                placeholder="Type your continuation here... (Markdown is supported)"
                            />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <hr className="flex-grow border-gray-200 dark:border-gray-700" />
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">OR UPLOAD FILE</span>
                            <hr className="flex-grow border-gray-200 dark:border-gray-700" />
                        </div>

                        {/* File Upload for Document Diffs */}
                        <div className={manualText.trim().length > 0 ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                            <FileUpload
                                combinedText={data?.getScriptById.combinedText}
                                handleFileChange={handleFileChange}
                                diffResult={diffResult}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!canSubmit || isSubmitting}
                                onClick={handleSubmitClick}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default Timeline;