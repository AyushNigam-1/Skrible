import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { diffChars } from "diff";
import { pdfjs } from "react-pdf";
import { Feather, PlusCircle, Send, X } from "lucide-react";
import FileUpload from "./FileUpload";
import { SUBMIT_PARAGRAPH } from "../graphql/mutation/scriptMutations";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ContributeModal = ({
  scriptId,
  combinedText,
  refetch,
  variant = "header",
}) => {
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
    const differences = diffChars(combinedText || "", uploadedText);
    setDiffResult(differences);
  };

  const handleCreateContribution = async (textToSubmit) => {
    if (!textToSubmit.trim()) return alert("Contribution cannot be empty");

    try {
      await submitParagraph({
        variables: {
          scriptId: scriptId,
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

  return (
    <>
      {/* Dynamic Trigger Button */}
      {variant === "empty" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors font-bold shadow-lg relative z-10 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Start Contributing
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg transition-all duration-300 text-sm font-bold shadow-lg shrink-0 ml-4 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Contribute
        </button>
      )}

      {/* Modal Dialog */}
      <Dialog
        open={isOpen}
        onClose={closeModal}
        className="relative z-50 font-['Inter']"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-[#0a0a0c]/80 backdrop-blur-md transition-opacity duration-500 ease-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-[2rem] bg-[#13151a]/95 backdrop-blur-3xl text-left shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out data-[closed]:translate-y-8 data-[closed]:opacity-0 data-[closed]:sm:scale-95 sm:my-8 w-full max-w-3xl border border-white/10"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

              <div className="relative flex justify-between items-start px-8 pt-10 pb-6 border-b border-white/5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold text-white font-['Playfair_Display'] tracking-tight flex items-center gap-3">
                    <Feather
                      className="w-7 h-7 text-amber-100/70"
                      strokeWidth={1.5}
                    />
                    Compose Continuation
                  </h3>
                  <p className="text-gray-400 font-['Literata'] text-base">
                    Add the next chapter to this manuscript. Your words shape
                    the story.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors mt-1 outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative px-8 py-8 flex flex-col gap-8">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-['Inter']">
                    Draft Content
                  </label>
                  <div className="absolute inset-0 bg-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10 pointer-events-none" />
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={8}
                    disabled={files.length > 0}
                    className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-black/20 text-white focus:bg-black/40 focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all outline-none placeholder:text-gray-600 font-['Literata'] text-lg shadow-inner resize-none leading-relaxed disabled:opacity-50"
                    placeholder="Write the next sequence here... (Markdown is supported)"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <hr className="flex-grow border-white/5" />
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold font-mono">
                    OR UPLOAD MANUSCRIPT
                  </span>
                  <hr className="flex-grow border-white/5" />
                </div>

                <div
                  className={
                    manualText.trim().length > 0
                      ? "opacity-30 pointer-events-none transition-all grayscale"
                      : "transition-all"
                  }
                >
                  <FileUpload
                    combinedText={combinedText}
                    handleFileChange={handleFileChange}
                    diffResult={diffResult}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 mt-2">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 rounded-2xl text-[15px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-['Inter']"
                  >
                    Discard
                  </button>

                  <button
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmitClick}
                    className="group flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-black hover:bg-gray-200 text-[15px] font-bold shadow-lg disabled:opacity-50 transition-all hover:-translate-y-0.5 active:scale-95 font-['Inter']"
                  >
                    {isSubmitting ? "Publishing..." : "Submit Entry"}
                    <Send className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ContributeModal;
