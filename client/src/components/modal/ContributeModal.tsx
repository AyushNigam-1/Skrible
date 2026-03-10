import React, { useState } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import {
  PlusCircle,
  Send,
  X,
  Loader2,
  Type,
  FileText,
  File,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { useSubmitParagraphMutation } from "../../graphql/generated/graphql";

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

  // --- New Field Added ---
  const [title, setTitle] = useState("");
  const [manualText, setManualText] = useState("");

  const [submitParagraph, { loading: isSubmitting }] =
    useSubmitParagraphMutation();

  const handleCreateContribution = async (finalPayload: string) => {
    try {
      await submitParagraph({
        variables: {
          scriptId: scriptId,
          text: finalPayload,
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
    setTitle("");
    setManualText("");
  };

  // Require both a title and content to submit
  const canSubmit = title.trim().length > 0 && manualText.trim().length > 0;

  const handleSubmitClick = () => {
    if (canSubmit) {
      // Format the title as a Markdown Header so it looks great in the review feed
      // without requiring any backend database schema changes!
      const finalPayload = `### ${title.trim()}\n\n${manualText.trim()}`;
      handleCreateContribution(finalPayload);
    }
  };

  // --- Sleek Theme Classes ---
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-gray-200 focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none placeholder:text-gray-600 text-sm font-sans shadow-inner disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass =
    "flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest font-sans";

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
          className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-gray-100 hover:bg-gray-200 border border-white/10 rounded-xl text-gray-800 text-sm md:text-base font-bold transition-all duration-300 shadow-sm active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add
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
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition duration-300 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 overflow-y-auto scrollbar-none">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-3xl bg-[#0f0f15] text-left shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 sm:my-8 w-full max-w-3xl border border-white/10 space-y-4 p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    New Contribution
                  </h3>
                  {/*<p className="text-sm text-gray-500 mt-1 font-medium">
                    Propose the next chapter or a new edit to this manuscript.
                  </p>*/}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <hr className="border-b border-white/5" />

              {/* Body */}
              <div className="flex flex-col gap-6">
                {/* --- NEW FIELD: Title / Summary --- */}
                <div>
                  <label className={labelClass}>
                    {/*<Type className="w-4 h-4 text-gray-500" />*/}
                    Summary
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className={inputClass}
                    placeholder="e.g., Introduced a new plot twist..."
                    autoFocus
                  />
                </div>

                {/* Main Content Area */}
                <div>
                  <label className={labelClass}>Content</label>
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={10}
                    disabled={isSubmitting}
                    className={clsx(
                      inputClass,
                      "resize-none leading-relaxed font-mono",
                    )}
                    placeholder="Write the next sequence here... (Markdown formatting is supported)"
                  />
                </div>
                <button
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmitClick}
                  className="group flex items-center mx-auto justify-center w-[140px] gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-bold disabled:opacity-50 font-mono disabled:shadow-none disabled:hover:bg-white transition-all tracking-wide active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 ml-1" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ContributeModal;
