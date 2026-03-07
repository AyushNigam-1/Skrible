import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlignLeft,
  User,
  Globe,
  Lock,
  Calendar,
  FileText,
  Languages,
  Tags,
  Edit2,
  Save,
  Loader2,
} from "lucide-react";

import Loader from "../../components/layout/Loader";
import { useMutation } from "@apollo/client";
import { UPDATE_SCRIPT } from "../../graphql/mutation/scriptMutations";

// --- Types ---
interface ScriptDetailsContext {
  data: {
    getScriptById: {
      id: string;
      description?: string;
      visibility?: string;
      createdAt?: string;
      author?: { id: string; username: string };
      genres?: string[];
      languages?: string[];
      paragraphs?: any[];
    };
  };
  loading: boolean;
  refetch: () => void;
}

type EditField = "description" | "genres" | "languages" | null;

const ScriptDetails = () => {
  const { data, loading, refetch } = useOutletContext<ScriptDetailsContext>();
  const script = data?.getScriptById;

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const isAuthor = currentUser?.id === script?.author?.id;

  const [updateScript, { loading: isUpdating }] = useMutation(UPDATE_SCRIPT);

  // Edit States
  const [editingField, setEditingField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea when editing description
  useEffect(() => {
    if (editingField === "description" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, editingField]);

  const handleEditClick = (field: EditField, initialValue: string) => {
    setEditingField(field);
    setEditValue(initialValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSave = async (field: EditField) => {
    if (!script) return;

    try {
      let variables: any = { scriptId: script.id };

      if (field === "description") variables.description = editValue;
      if (field === "genres")
        variables.genres = editValue
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean);
      if (field === "languages")
        variables.languages = editValue
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);

      await updateScript({ variables });
      await refetch();
      setEditingField(null);
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center w-full min-h-[50vh]"
      >
        <Loader />
      </motion.div>
    );
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(Number(isoString));
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date); // Adjusted format to match your clean screenshot
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      id="details"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full mx-auto font-mono pb-10"
    >
      <div className="flex flex-col gap-6">
        {/* --- Unified Metadata Grid --- */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Author */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest leading-none">
                Original Author
              </p>
              <p className="text-base font-bold text-white leading-none truncate">
                @{script?.author?.username}
              </p>
            </div>
          </motion.div>

          {/* Created On */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest leading-none">
                Created On
              </p>
              <p className="text-base font-bold text-white leading-none truncate">
                {formatDate(script?.createdAt)}
              </p>
            </div>
          </motion.div>

          {/* Visibility */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              {script?.visibility === "Public" ? (
                <Globe className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest leading-none">
                Visibility
              </p>
              <p className="text-base font-bold text-white leading-none capitalize truncate">
                {script?.visibility}
              </p>
            </div>
          </motion.div>

          {/* Approved Contributions */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest leading-none">
                Approved Contributions
              </p>
              <p className="text-base font-bold text-white leading-none truncate">
                {script?.paragraphs?.length || 0}
              </p>
            </div>
          </motion.div>

          {/* Genres (Now perfectly matches other metadata cards) */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <Tags className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">
                  Genres
                </p>
                {isAuthor && editingField !== "genres" && (
                  <button
                    onClick={() =>
                      handleEditClick(
                        "genres",
                        script?.genres?.join(", ") || "",
                      )
                    }
                    className="text-[10px] text-gray-400 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 active:scale-95 transition-colors hover:bg-white/10 font-bold uppercase tracking-wider"
                  >
                    <Edit2 className="w-2.5 h-2.5" /> Edit
                  </button>
                )}
              </div>
              <AnimatePresence mode="wait">
                {editingField === "genres" ? (
                  <motion.div
                    key="edit-genres"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-2 mt-2"
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Fantasy, Mystery..."
                      className="w-full p-2 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-1 focus:ring-white/50 text-sm outline-none shadow-inner"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="text-[10px] font-bold text-gray-400 hover:text-white px-2 py-1 hover:bg-white/5 rounded transition-colors uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave("genres")}
                        disabled={isUpdating}
                        className="flex items-center gap-1 text-[10px] bg-white text-black px-3 py-1 rounded font-bold uppercase tracking-wide active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                      >
                        {isUpdating && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}{" "}
                        Save
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-genres"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1.5 flex-wrap mt-1"
                  >
                    {script?.genres && script.genres.length > 0 ? (
                      script.genres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white/5 text-white rounded-md text-[11px] font-bold border border-white/10 shadow-sm"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">None</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Languages (Now perfectly matches other metadata cards) */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <Languages className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">
                  Languages
                </p>
                {isAuthor && editingField !== "languages" && (
                  <button
                    onClick={() =>
                      handleEditClick(
                        "languages",
                        script?.languages?.join(", ") || "",
                      )
                    }
                    className="text-[10px] text-gray-400 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 active:scale-95 transition-colors hover:bg-white/10 font-bold uppercase tracking-wider"
                  >
                    <Edit2 className="w-2.5 h-2.5" /> Edit
                  </button>
                )}
              </div>
              <AnimatePresence mode="wait">
                {editingField === "languages" ? (
                  <motion.div
                    key="edit-lang"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-2 mt-2"
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="English, Spanish..."
                      className="w-full p-2 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-1 focus:ring-white/50 text-sm outline-none shadow-inner"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="text-[10px] font-bold text-gray-400 hover:text-white px-2 py-1 hover:bg-white/5 rounded transition-colors uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave("languages")}
                        disabled={isUpdating}
                        className="flex items-center gap-1 text-[10px] bg-white text-black px-3 py-1 rounded font-bold uppercase tracking-wide active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                      >
                        {isUpdating && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}{" "}
                        Save
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-lang"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1.5 flex-wrap mt-1"
                  >
                    {script?.languages && script.languages.length > 0 ? (
                      script.languages.map((language, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white/5 text-white rounded-md text-[11px] font-bold border border-white/10 shadow-sm"
                        >
                          {language}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">None</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Synopsis / Description Card (Moved to Bottom) --- */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white font-sans tracking-tight">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Synopsis
            </h3>
            {isAuthor && editingField !== "description" && (
              <button
                onClick={() =>
                  handleEditClick("description", script?.description || "")
                }
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 font-bold uppercase tracking-wider"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editingField === "description" ? (
              <motion.div
                key="edit-desc"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 overflow-hidden"
              >
                <textarea
                  ref={textareaRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-white/50 focus:border-white/50 outline-none transition-all resize-none overflow-hidden text-lg leading-relaxed placeholder-gray-600 font-['Literata'] shadow-inner"
                  placeholder="Write the synopsis..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-5 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave("description")}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="view-desc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-300 leading-relaxed text-sm md:text-base font-['Literata']"
              >
                {script?.description ||
                  "No description provided for this draft."}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ScriptDetails;
