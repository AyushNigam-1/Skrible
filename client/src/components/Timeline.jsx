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
import { FileText, PlusCircle, Clock, Send, X } from "lucide-react";
import Search from "./Search";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Timeline = () => {
  const nav = useNavigate();
  const { data, refetch, loading } = useOutletContext();
  const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileText, setFileText] = useState("");
  const [diffResult, setDiffResult] = useState(null);
  const [manualText, setManualText] = useState("");

  const [submitParagraph, { loading: isSubmitting }] =
    useMutation(SUBMIT_PARAGRAPH);

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
    const differences = diffChars(
      data?.getScriptById.combinedText || "",
      uploadedText,
    );
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

  const hasDiffAdditions = diffResult && diffResult.some((d) => d.added);
  const canSubmit = manualText.trim().length > 0 || hasDiffAdditions;

  const handleSubmitClick = () => {
    if (manualText.trim()) {
      handleCreateContribution(manualText);
    } else if (hasDiffAdditions) {
      const addedText = diffResult
        .filter((d) => d.added)
        .map((d) => d.value)
        .join(" ");
      handleCreateContribution(addedText);
    }
  };

  if (loading) return <Loader />;

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
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
    <div className="flex flex-col gap-8 w-full mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        {/* <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-gray  font-mono tracking-tight flex items-center gap-3">
            Timeline
          </h2>
        </div>*/}
        <Search
          setSearch={setSearchQuery}
          placeholder="Search contributors..."
        />

        {paragraphs.length > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/50 text-blue-400 hover:text-white rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 font-mono text-sm font-bold"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            CONTRIBUTE
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {paragraphs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-white/5 rounded-3xl bg-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-6 shadow-inner relative z-10">
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-wide z-10">
            NO ENTRIES FOUND
          </h3>
          <p className="text-gray-400 max-w-md mb-8 text-sm font-mono leading-relaxed z-10">
            This repository is currently empty. Initialize the narrative by
            submitting the first block.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 font-mono font-bold shadow-lg shadow-blue-900/40 active:scale-95 z-10"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            INITIALIZE DRAFT
          </button>
        </div>
      )}

      {/* VERTICAL TIMELINE LIST */}
      {paragraphs.length > 0 && (
        <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 space-y-12 pb-8">
          {sortedDates.map((date) => (
            <div key={date} className="relative pl-8 md:pl-12">
              {/* Glowing Timeline Node & Date */}
              <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-blue-900 border-4 border-[#0B0F19] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              <h4 className="text-sm font-bold text-blue-400 font-mono uppercase tracking-widest mb-6 bg-blue-500/10 inline-block px-3 py-1 rounded-md border border-blue-500/20">
                {date}
              </h4>

              {/* Cards for this date */}
              <div className="flex flex-col gap-6">
                {groupedParagraphs[date].map((p) => (
                  <Link
                    key={p.id}
                    to={`/contribution/${p.id}`}
                    className="group block bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-900/20 relative overflow-hidden"
                  >
                    {/* Subtle gradient hover effect inside card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-colors duration-500 pointer-events-none" />

                    {/* Author Info */}
                    {/* <div className="flex items-center gap-3 mb-5 relative z-10">*/}
                    {/* <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all">
                        {p.author.username.charAt(0).toUpperCase()}
                      </div>*/}
                    <p className="font-mono font-bold  text-gray-300 group-hover:text-white transition-colors">
                      @{p.author.username}
                    </p>
                    {/* </div>*/}

                    {/* Content - Keeps Crimson_Pro for reading readability */}
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300 text-lg leading-relaxed relative z-10">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {p.text}
                      </ReactMarkdown>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTRIBUTION MODAL (Sleek Frosted Glass) */}
      <Dialog
        open={isOpen}
        onClose={closeModal}
        className="relative z-50 font-mono"
      >
        <div
          className="fixed inset-0 bg-[#000000cc] backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-3xl w-full bg-[#11131A]/80 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                <span className="text-blue-500">~/</span> New_Contribution
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Text Area */}
            <div className="mb-6 relative group">
              <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">
                Input Buffer
              </label>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-md -z-10" />
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={7}
                disabled={files.length > 0}
                className="w-full p-5 border border-white/10 rounded-2xl bg-black/40 text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 font-['Crimson_Pro'] text-lg leading-relaxed placeholder-gray-600 resize-none shadow-inner"
                placeholder="Start typing the next sequence... (Markdown supported)"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <hr className="flex-grow border-white/5" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                OR UPLOAD .MD / .PDF
              </span>
              <hr className="flex-grow border-white/5" />
            </div>

            {/* File Upload Area */}
            <div
              className={
                manualText.trim().length > 0
                  ? "opacity-30 pointer-events-none transition-all grayscale"
                  : "transition-all"
              }
            >
              <FileUpload
                combinedText={data?.getScriptById.combinedText}
                handleFileChange={handleFileChange}
                diffResult={diffResult}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-white/10">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors uppercase tracking-widest"
              >
                Abort
              </button>

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmitClick}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-95 text-xs font-bold uppercase tracking-widest"
              >
                {isSubmitting ? "Transmitting..." : "Commit Changes"}
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default Timeline;
