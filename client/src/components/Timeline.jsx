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
import Search from "./Search";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Timeline = () => {
  const nav = useNavigate();
  const { data, refetch, loading } = useOutletContext();
  const [isDownloading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileText, setFileText] = useState("");
  const [diffResult, setDiffResult] = useState(null);
  const [popover, setPopover] = useState(false);

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
      {/* Header with Contribute Button */}
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
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors font-bold shadow-lg relative z-10"
          >
            <PlusCircle className="w-5 h-5" />
            Start Contributing
          </button>
        </div>
      )}
      {paragraphs.length > 0 && (
        <div className="flex justify-between items-center">
          <Search
            setSearch={setSearchQuery}
            placeholder="Search contributors..."
          />

          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg transition-colors text-sm font-bold shadow-lg shrink-0 ml-4"
          >
            <PlusCircle className="w-4 h-4" />
            Contribute
          </button>
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
                  <div className="size-6 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold">
                    {p.author.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-mono text-sm font-bold text-white">
                    @{p.author.username}
                  </p>
                </div>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-300 text-lg leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {p.text}
                  </ReactMarkdown>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Contribution Modal */}
      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-2xl w-full bg-[#130f1c]/90 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-4 text-white font-['Playfair_Display']">
              Add Contribution
            </h3>

            {/* Text Area for Direct Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-200 mb-2 font-mono">
                Write your draft addition
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={6}
                disabled={files.length > 0}
                className="w-full p-4 border border-white/20 rounded-xl bg-black/40 text-gray-200 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition-all disabled:opacity-50 text-lg leading-relaxed placeholder-gray-600"
                placeholder="Type your continuation here... (Markdown is supported)"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <hr className="flex-grow border-white/10" />
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold font-mono">
                OR UPLOAD FILE
              </span>
              <hr className="flex-grow border-white/10" />
            </div>

            {/* File Upload for Document Diffs */}
            <div
              className={
                manualText.trim().length > 0
                  ? "opacity-50 pointer-events-none transition-opacity"
                  : "transition-opacity"
              }
            >
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
                className="px-4 py-2 text-sm font-mono font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmitClick}
                className="px-6 py-2 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white text-black rounded-lg transition-colors text-sm font-bold font-mono tracking-wide"
              >
                {isSubmitting ? "Submitting..." : "Submit Contribution"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default Timeline;
