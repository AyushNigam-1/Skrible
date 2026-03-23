import { useState, useRef, useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlignLeft, User, Globe, Lock, Calendar, FileText,
  Languages, Tags, Edit2, Save, Loader2, X, Type,
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
// 🚨 Cleaned up: text-xs (16px line-height) perfectly aligns with w-4 h-4 (16px) icons.
const btnBase = "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 select-none";

const EditControls = ({
  field, hint, editingField, isUpdating, onEdit, onCancel, onSave,
}: {
  field: EditField;
  hint: string;
  editingField: EditField;
  isUpdating: boolean;
  onEdit: (f: EditField) => void;
  onCancel: () => void;
  onSave: (f: EditField) => void;
}) => (
  <div className="ml-auto relative flex items-center overflow-hidden">
    <AnimatePresence mode="wait" initial={false}>
      {editingField !== field ? (
        <motion.button
          key="edit"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          onClick={() => onEdit(field)}
          className={`${btnBase} text-gray-400 hover:text-white hover:bg-white/5`}
        >
          {/* 🚨 Scaled up to w-4 h-4 */}
          <Edit2 className="w-4 shrink-0" />
          {/* <span>Edit</span> */}
        </motion.button>
      ) : (
        <motion.div
          key="actions"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className={`${btnBase} text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50`}
          >
            <X className="w-4 h-4 shrink-0" />
            <span>Esc</span>
          </button>

          <button
            onClick={() => onSave(field)}
            disabled={isUpdating}
            className={`${btnBase} border border-white/10 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 shadow-sm`}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            ) : (
              <Save className="w-4 h-4 shrink-0" />
            )}
            <span className="hidden sm:inline">{hint}</span>
            <span className="sm:hidden">Save</span>
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

  useLayoutEffect(() => {
    if (!editingField || !editRef.current) return;

    let initialText = "";
    if (editingField === "title") initialText = script?.title || "";
    if (editingField === "description") initialText = script?.description || "";
    if (editingField === "genres") initialText = script?.genres?.join(", ") || "";
    if (editingField === "languages") initialText = script?.languages?.join(", ") || "";

    editRef.current.innerText = initialText;
    editRef.current.focus();

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editRef.current);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [editingField]);

  const handleEditClick = (field: EditField) => setEditingField(field);
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center w-full min-h-[50vh]">
        <Loader />
      </motion.div>
    );
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Unknown Date";
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(Number(isoString)));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
  };

  const cardClass = "bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col hover:border-white/20 transition-colors";
  const iconClass = "w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 shrink-0";
  const headerClass = "flex items-center gap-2 sm:gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-widest";

  const metadataCards = [
    { id: "author", label: "Author", value: script?.author?.name ? `${script.author.name}` : "Unknown", icon: <User className={iconClass} /> },
    { id: "created", label: "Published", value: formatDate(script?.createdAt), icon: <Calendar className={iconClass} /> },
    { id: "visibility", label: "Visibility", value: script?.visibility || "Unknown", icon: script?.visibility === "Public" ? <Globe className={iconClass} /> : <Lock className={iconClass} />, isCapitalized: true },
    { id: "contributions", label: "Contributions", value: script?.paragraphs?.length || 0, icon: <FileText className={iconClass} /> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" id="details" className="w-full mx-auto font-mono flex flex-col gap-3 sm:gap-5">

      {/* TITLE */}
      <motion.div variants={itemVariants} className={cardClass}>
        <div className="flex justify-between items-center mb-2 sm:mb-3 min-h-[28px] sm:min-h-[32px]">
          <h3 className={headerClass}>
            <Type className={iconClass} /> Title
          </h3>
          {isAuthor && <EditControls field="title" hint="Enter" {...editControlProps} />}
        </div>
        <div
          ref={editingField === "title" ? editRef : undefined}
          contentEditable={editingField === "title"}
          suppressContentEditableWarning
          onKeyDown={(e) => handleKeyDown(e as any, "title")}
          className={`text-white font-bold text-xl sm:text-2xl font-sans px-3 py-2 -mx-3 outline-none whitespace-pre-wrap break-words rounded-xl transition-all ${editingField === "title" ? "bg-black/40 border border-white/20 shadow-inner" : "border border-transparent"}`}
        >
          {editingField !== "title" ? (script?.title || "Untitled Draft") : undefined}
        </div>
      </motion.div>

      {/* DESCRIPTION */}
      <motion.div variants={itemVariants} className={cardClass}>
        <div className="flex justify-between items-center mb-2 sm:mb-3 min-h-[28px] sm:min-h-[32px]">
          <h3 className={headerClass}>
            <AlignLeft className={iconClass} /> Description
          </h3>
          {isAuthor && <EditControls field="description" hint="⌘ Enter" {...editControlProps} />}
        </div>
        <div
          ref={editingField === "description" ? editRef : undefined}
          contentEditable={editingField === "description"}
          suppressContentEditableWarning
          onKeyDown={(e) => handleKeyDown(e as any, "description")}
          className={`text-gray-300 leading-relaxed text-base sm:text-lg font-sans px-3 py-2 -mx-3 outline-none whitespace-pre-wrap break-words rounded-xl transition-all ${editingField === "description" ? "bg-black/40 border border-white/20 shadow-inner" : "border border-transparent"}`}
        >
          {editingField !== "description" ? (script?.description || "No synopsis provided for this draft.") : undefined}
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {/* READ ONLY METADATA */}
        {metadataCards.map((card) => (
          <motion.div variants={itemVariants} key={card.id} className={`${cardClass} gap-2 sm:gap-3`}>
            <h3 className={headerClass}>
              {card.icon}
              {card.label}
            </h3>
            <p className={`text-white font-bold font-sans text-lg sm:text-xl ${card.isCapitalized ? "capitalize" : ""}`}>
              {card.value}
            </p>
          </motion.div>
        ))}

        {/* GENRES */}
        <motion.div variants={itemVariants} className={cardClass}>
          <div className="flex justify-between items-center mb-2 sm:mb-3 min-h-[28px] sm:min-h-[32px]">
            <h3 className={headerClass}>
              <Tags className={iconClass} />
              Genres
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] text-gray-500 normal-case tracking-normal">max {MAX_TAGS}</span>
            </h3>
            {isAuthor && <EditControls field="genres" hint="Enter" {...editControlProps} />}
          </div>
          {editingField === "genres" ? (
            <div
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={(e) => handleKeyDown(e as any, "genres")}
              className="text-white text-sm sm:text-base font-sans px-3 py-2 -mx-3 outline-none whitespace-pre-wrap break-words bg-black/40 border border-white/20 shadow-inner rounded-xl"
            />
          ) : (
            <div className="flex gap-2 flex-wrap px-3 py-2 -mx-3 border border-transparent">
              {script?.genres?.length
                ? script.genres.slice(0, MAX_TAGS).map((g, i) => (
                  <span key={i} className="px-2.5 sm:px-3 py-1 bg-white/5 text-gray-300 rounded-md text-xs sm:text-sm font-semibold border border-white/10 font-sans">{g}</span>
                ))
                : <span className="text-gray-500 italic text-sm sm:text-base font-sans">None</span>
              }
            </div>
          )}
        </motion.div>

        {/* LANGUAGES */}
        <motion.div variants={itemVariants} className={cardClass}>
          <div className="flex justify-between items-center mb-2 sm:mb-3 min-h-[28px] sm:min-h-[32px]">
            <h3 className={headerClass}>
              <Languages className={iconClass} />
              Languages
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] text-gray-500 normal-case tracking-normal">max {MAX_TAGS}</span>
            </h3>
            {isAuthor && <EditControls field="languages" hint="Enter" {...editControlProps} />}
          </div>
          {editingField === "languages" ? (
            <div
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={(e) => handleKeyDown(e as any, "languages")}
              className="text-white text-sm sm:text-base font-sans px-3 py-2 -mx-3 outline-none whitespace-pre-wrap break-words bg-black/40 border border-white/20 shadow-inner rounded-xl"
            />
          ) : (
            <div className="flex gap-2 flex-wrap px-3 py-2 -mx-3 border border-transparent">
              {script?.languages?.length
                ? script.languages.slice(0, MAX_TAGS).map((l, i) => (
                  <span key={i} className="px-2.5 sm:px-3 py-1 bg-white/5 text-gray-300 rounded-md text-xs sm:text-sm font-semibold border border-white/10 font-sans">{l}</span>
                ))
                : <span className="text-gray-500 italic text-sm sm:text-base font-sans">None</span>
              }
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ScriptDetails;