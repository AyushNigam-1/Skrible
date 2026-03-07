import React, { useState } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { pdfjs } from "react-pdf";
import { Feather, PlusCircle, Send, X, Loader2 } from "lucide-react";
import clsx from "clsx";

// Import the generated mutation hook
import { useSubmitParagraphMutation } from "../../graphql/generated/graphql";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface ContributeModalProps {
  scriptId: string;
  refetch: () => void;
  variant?: "header" | "empty";
}

const ContributeModal = ({
  scriptId,
  refetch,
  variant = "header",
}: ContributeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileText, setFileText] = useState("");
  const [manualText, setManualText] = useState("");

  const [submitParagraph, { loading: isSubmitting }] =
    useSubmitParagraphMutation();

  const handleCreateContribution = async (textToSubmit: string) => {
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
    setFileText("");
    setFiles([]);
  };

  const canSubmit = manualText.trim().length > 0 || fileText.trim().length > 0;

  const handleSubmitClick = () => {
    // If files are uploaded, submit the extracted file text; otherwise, submit manual text
    const textToSubmit = files.length > 0 ? fileText : manualText;

    if (textToSubmit.trim()) {
      handleCreateContribution(textToSubmit);
    }
  };

  // --- Sleek Theme Classes ---
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-gray-200 focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all outline-none placeholder:text-gray-600 text-sm font-sans shadow-inner disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass =
    "block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest font-sans";

  return (
    <>
      {/* Dynamic Trigger Button */}
      {variant === "empty" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 font-bold shadow-sm active:scale-95 font-sans"
        >
          <PlusCircle className="w-5 h-5" />
          Start Contributing
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-300 text-sm font-semibold shadow-sm shrink-0 ml-4 active:scale-95 font-sans"
        >
          <PlusCircle className="w-4 h-4" />
          Contribute
        </button>
      )}

      {/* Modal Dialog */}
      <Dialog
        open={isOpen}
        onClose={closeModal}
        className="relative z-50 font-sans"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-2xl bg-[#121216] text-left shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 sm:my-8 w-full max-w-3xl border border-white/10 p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  {/*<div className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-300">
                    <Feather size={18} strokeWidth={2} />
                  </div>*/}
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      Compose Continuation
                    </h3>
                    {/*<p className="text-sm text-gray-500 mt-0.5">
                      Add the next chapter to this manuscript.
                    </p>*/}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-6">
                <div>
                  {/*<label className={labelClass}>Draft Content</label>*/}
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={8}
                    disabled={files.length > 0}
                    className={clsx(inputClass, "resize-none leading-relaxed")}
                    placeholder="Write the next sequence here... (Markdown is supported)"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-white/5">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Discard
                  </button>

                  <button
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmitClick}
                    className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-bold shadow-lg disabled:opacity-50 transition-colors tracking-wide active:scale-95"
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    )}
                    {isSubmitting ? "Publishing..." : "Submit Entry"}
                    {!isSubmitting && (
                      <Send className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    )}
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
