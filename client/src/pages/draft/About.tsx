import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, Variants, AnimatePresence, Transition } from "framer-motion";
import { toast } from "sonner";
import {
  AlignLeft, User, Globe, Lock, Calendar, FileText,
  Languages, Tags, Edit2, Loader2, X, Type, Check, Users,
} from "lucide-react";

import Loader from "../../components/layout/Loader";
import { useMutation } from "@apollo/client";
import { UPDATE_SCRIPT } from "../../graphql/mutation/scriptMutations";
import { useUserStore } from "../../store/useAuthStore";

interface ScriptDetailsContext {
  data: {
    getScriptById: {
      id: string;
      title?: string;
      description?: string;
      visibility?: string;
      createdAt?: string;
      author?: { id: string; name: string };
      genres?: string[];
      languages?: string[];
      paragraphs?: any[];
    };
  };
  loading: boolean;
  refetch: () => void;
}

type EditField = "title" | "description" | "genres" | "languages" | null;

const MAX_TAGS = 4;

// 🚨 MOVED OUTSIDE: All static classes and animations moved outside so they don't trigger re-renders
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};

const fieldTransition: Transition = { duration: 0.25, ease: "easeInOut" };
const fieldVariants = {
  hidden: { opacity: 0, y: 4, filter: "blur(2px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -4, filter: "blur(2px)" }
};

const cardClass = "bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col hover:border-white/20 transition-colors gap-2 sm:gap-3";
const iconClass = "w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 shrink-0";
const headerClass = "flex items-center gap-2 sm:gap-2.5 text-xs font-semibold text-gray-500 uppercase tracking-widest";

// 🚨 MOVED OUTSIDE: This prevents React from destroying and recreating the card, stopping the "blink"
const ReadOnlyCard = ({ icon: Icon, label, value, isCapitalized = false }: { icon: any, label: string, value: string | number, isCapitalized?: boolean }) => (
  <motion.div variants={itemVariants} className={cardClass}>
    <h3 className={headerClass}>
      <Icon className={iconClass} />
      {label}
    </h3>
    <p className={`text-gray-200 font-semibold font-sans text-lg sm:text-xl ${isCapitalized ? "capitalize" : ""}`}>
      {value}
    </p>
  </motion.div>
);

const EditControls = ({
  field, editingField, isUpdating, onEdit, onCancel, onSave,
}: {
  field: EditField;
  editingField: EditField;
  isUpdating: boolean;
  onEdit: (f: EditField) => void;
  onCancel: () => void;
  onSave: (f: EditField) => void;
}) => (
  <div className="ml-auto relative flex items-center justify-end min-w-[48px] min-h-[20px]">
    <AnimatePresence mode="wait" initial={false}>
      {editingField !== field ? (
        <motion.button
          key="edit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          onClick={() => onEdit(field)}
          className="text-gray-500 hover:text-gray-200 transition-colors outline-none"
        >
          <Edit2 className="w-4 h-4 shrink-0" />
        </motion.button>
      ) : (
        <motion.div
          key="actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="text-gray-500 hover:text-gray-200 transition-colors disabled:opacity-50 outline-none"
            title="Cancel"
          >
            <X className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => onSave(field)}
            disabled={isUpdating}
            className="text-green-500 hover:text-green-400 transition-colors disabled:opacity-50 outline-none"
            title="Save changes"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            ) : (
              <Check className="w-4 h-4 shrink-0 stroke-[3]" />
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ScriptDetails = () => {
  const { data, loading } = useOutletContext<ScriptDetailsContext>();
  const script = data?.getScriptById;

  const { user } = useUserStore();
  const isAuthor = user?.id === script?.author?.id;

  const [updateScript, { loading: isUpdating }] = useMutation(UPDATE_SCRIPT);
  const [editingField, setEditingField] = useState<EditField>(null);
  const editRef = useRef<HTMLDivElement>(null);

  const uniqueContributorsCount = new Set(
    script?.paragraphs?.map((p: any) => p.author?.id || p.author?.name).filter(Boolean)
  ).size;

  const handleEditClick = (field: EditField) => {
    setEditingField(field);
    setTimeout(() => {
      if (editRef.current) {
        editRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(editRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 50);
  };

  const handleCancelEdit = () => setEditingField(null);

  const handleSave = (field: EditField) => {
    if (!script || !editRef.current) return;
    const rawText = editRef.current.innerText.trim();
    let variables: any = { scriptId: script.id };

    if (field === "title") variables.title = rawText;
    if (field === "description") variables.description = rawText;
    if (field === "genres") variables.genres = rawText.split(",").map((g) => g.trim()).filter(Boolean).slice(0, MAX_TAGS);
    if (field === "languages") variables.languages = rawText.split(",").map((l) => l.trim()).filter(Boolean).slice(0, MAX_TAGS);

    const promise = updateScript({
      variables,
      update(cache, { data: { updateScript } }) {
        if (!updateScript) return;
        cache.modify({
          id: cache.identify(updateScript),
          fields: {
            title: (e) => updateScript.title ?? e,
            description: (e) => updateScript.description ?? e,
            genres: (e) => updateScript.genres ?? e,
            languages: (e) => updateScript.languages ?? e,
          },
        });
      },
    }).then(() => setEditingField(null));

    toast.promise(promise, {
      loading: "Saving...",
      success: `${field!.charAt(0).toUpperCase() + field!.slice(1)} updated!`,
      error: "Failed to save.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: EditField) => {
    if (e.key === "Escape") handleCancelEdit();
    if (e.key === "Enter") {
      if (field === "description") {
        if (e.metaKey || e.ctrlKey) { e.preventDefault(); handleSave(field); }
      } else {
        e.preventDefault();
        handleSave(field);
      }
    }
  };

  const editControlProps = { editingField, isUpdating, onEdit: handleEditClick, onCancel: handleCancelEdit, onSave: handleSave };

  if (loading && !script) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center w-full min-h-[96vh]">
        <Loader />
      </motion.div>
    );
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Unknown Date";
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(Number(isoString)));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      id="details"
      className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full mx-auto font-mono"
    >
      {/* ROW 1: TITLE (Half) & AUTHOR (Half) */}
      <motion.div variants={itemVariants} className={cardClass}>
        <div className="flex justify-between items-center w-full">
          <h3 className={headerClass}>
            <Type className={iconClass} />
            Title
            <AnimatePresence>
              {editingField === "title" && (
                <motion.span
                  initial={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="ml-1 px-1.5 py-0.5 rounded text-xs text-gray-200 bg-white/5 animate-pulse normal-case tracking-normal"
                >
                  Editing...
                </motion.span>
              )}
            </AnimatePresence>
          </h3>
          {isAuthor && <EditControls field="title" {...editControlProps} />}
        </div>
        <div
          ref={editingField === "title" ? editRef : undefined}
          contentEditable={editingField === "title"}
          suppressContentEditableWarning
          onKeyDown={(e) => handleKeyDown(e as any, "title")}
          className="text-gray-200 font-semibold text-xl sm:text-2xl font-sans outline-none whitespace-pre-wrap break-words w-full transition-all duration-300"
        >
          {script?.title || "Untitled Draft"}
        </div>
      </motion.div>

      <ReadOnlyCard
        icon={User}
        label="Author"
        value={script?.author?.name ? `${script.author.name}` : "Unknown"}
      />
      {/* ROW 3: PUBLISHED (Half) & VISIBILITY (Half) */}
      <ReadOnlyCard
        icon={Calendar}
        label="Published"
        value={formatDate(script?.createdAt)}
      />
      <ReadOnlyCard
        icon={Globe}
        label="Visibility"
        value={script?.visibility || "Unknown"}
        isCapitalized
      />

      {/* ROW 4: CONTRIBUTIONS (Half) & CONTRIBUTORS (Half) */}
      <ReadOnlyCard
        icon={FileText}
        label="Contributions"
        value={script?.paragraphs?.length || 0}
      />
      <ReadOnlyCard
        icon={Users}
        label="Contributors"
        value={uniqueContributorsCount}
      />
      {/* ROW 2: GENRES (Half) & LANGUAGES (Half) */}
      <motion.div variants={itemVariants} className={cardClass}>
        <div className="flex justify-between items-center w-full">
          <h3 className={headerClass}>
            <Tags className={iconClass} />
            Genres
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] text-gray-500 normal-case tracking-normal">max {MAX_TAGS}</span>
            <AnimatePresence>
              {editingField === "genres" && (
                <motion.span
                  initial={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="ml-1 px-1.5 py-0.5 rounded text-xs text-gray-200 bg-white/5 animate-pulse normal-case tracking-normal"
                >
                  Editing...
                </motion.span>
              )}
            </AnimatePresence>
          </h3>
          {isAuthor && <EditControls field="genres" {...editControlProps} />}
        </div>

        <AnimatePresence mode="popLayout">
          {editingField === "genres" ? (
            <motion.div
              key="genres-edit"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={fieldTransition}
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={(e) => handleKeyDown(e as any, "genres")}
              className="text-gray-200 text-sm sm:text-base font-sans outline-none whitespace-pre-wrap break-words w-full"
            >
              {script?.genres?.join(", ") || ""}
            </motion.div>
          ) : (
            <motion.div
              key="genres-view"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={fieldTransition}
              className="flex gap-2 flex-wrap border border-transparent w-full"
            >
              {script?.genres?.length
                ? script.genres.slice(0, MAX_TAGS).map((g, i) => (
                  <span key={i} className="px-2.5 sm:px-3 py-1 bg-white/5 text-gray-300 rounded-md text-xs sm:text-sm font-semibold border border-white/10 font-sans">{g}</span>
                ))
                : <span className="text-gray-500 italic text-sm sm:text-base font-sans">None</span>
              }
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className={cardClass}>
        <div className="flex justify-between items-center w-full">
          <h3 className={headerClass}>
            <Languages className={iconClass} />
            Languages
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] text-gray-500 normal-case tracking-normal">max {MAX_TAGS}</span>
            <AnimatePresence>
              {editingField === "languages" && (
                <motion.span
                  initial={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="ml-1 px-1.5 py-0.5 rounded text-xs text-gray-200 bg-white/5 animate-pulse normal-case tracking-normal"
                >
                  Editing...
                </motion.span>
              )}
            </AnimatePresence>
          </h3>
          {isAuthor && <EditControls field="languages" {...editControlProps} />}
        </div>

        <AnimatePresence mode="popLayout">
          {editingField === "languages" ? (
            <motion.div
              key="languages-edit"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={fieldTransition}
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={(e) => handleKeyDown(e as any, "languages")}
              className="text-gray-200 text-sm sm:text-base font-sans outline-none whitespace-pre-wrap break-words w-full"
            >
              {script?.languages?.join(", ") || ""}
            </motion.div>
          ) : (
            <motion.div
              key="languages-view"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={fieldTransition}
              className="flex gap-2 flex-wrap border border-transparent w-full"
            >
              {script?.languages?.length
                ? script.languages.slice(0, MAX_TAGS).map((l, i) => (
                  <span key={i} className="px-2.5 sm:px-3 py-1 bg-white/5 text-gray-300 rounded-md text-xs sm:text-sm font-semibold border border-white/10 font-sans">{l}</span>
                ))
                : <span className="text-gray-500 italic text-sm sm:text-base font-sans">None</span>
              }
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div variants={itemVariants} className={`${cardClass} md:col-span-2`}>
        <div className="flex justify-between items-center w-full">
          <h3 className={headerClass}>
            <AlignLeft className={iconClass} />
            Description
            <AnimatePresence>
              {editingField === "description" && (
                <motion.span
                  initial={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="ml-1 px-1.5 py-0.5 rounded text-xs text-gray-200 bg-white/5 animate-pulse normal-case tracking-normal"
                >
                  Editing...
                </motion.span>
              )}
            </AnimatePresence>
          </h3>
          {isAuthor && <EditControls field="description" {...editControlProps} />}
        </div>

        <div
          ref={editingField === "description" ? editRef : undefined}
          contentEditable={editingField === "description"}
          suppressContentEditableWarning
          onKeyDown={(e) => handleKeyDown(e as any, "description")}
          className="text-gray-200 font-semibold text-xl sm:text-xl font-sans outline-none whitespace-pre-wrap break-words w-full transition-all duration-300"
        >
          {script?.description || "No synopsis provided for this draft."}
        </div>
      </motion.div>

    </motion.div>
  );
};

export default ScriptDetails;