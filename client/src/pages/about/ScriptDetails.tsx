import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  X,
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
    }).format(date);
  };

  // --- Premium Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
  };

  // --- Data Array for DRY Mapping ---
  const metadataCards = [
    {
      id: "author",
      label: "Author",
      value: `@${script?.author?.username || "Unknown"}`,
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "created",
      label: "Publised",
      value: formatDate(script?.createdAt),
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "visibility",
      label: "Visibility",
      value: script?.visibility || "Unknown",
      icon:
        script?.visibility === "Public" ? (
          <Globe className="w-5 h-5" />
        ) : (
          <Lock className="w-5 h-5" />
        ),
      isCapitalized: true,
    },
    {
      id: "contributions",
      label: "Contributions",
      value: script?.paragraphs?.length || 0,
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <motion.div
      id="details"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full mx-auto font-mono pb-10"
    >
      <div className="flex flex-col gap-5">
        <motion.div
          variants={itemVariants}
          layout
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col hover:border-white/10 transition-colors"
        >
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white font-sans tracking-tight">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Description
            </h3>
            {isAuthor && editingField !== "description" && (
              <button
                onClick={() =>
                  handleEditClick("description", script?.description || "")
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-transparent text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider ml-auto"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {editingField === "description" ? (
              <motion.div
                key="edit-desc"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 overflow-hidden w-full"
              >
                <textarea
                  ref={textareaRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-gray-200 focus:border-white/30 outline-none transition-all resize-none overflow-hidden text-base leading-relaxed placeholder-gray-600 font-sans"
                  placeholder="Write the synopsis..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-transparent text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={() => handleSave("description")}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all uppercase tracking-wider disabled:opacity-50"
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
                className="text-gray-400 leading-relaxed text-lg"
              >
                {script?.description || "No synopsis provided for this draft."}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Mapped Read-Only Metadata Cards */}
          {metadataCards.map((card) => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              layout
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-center w-11 h-11 bg-white/5 border border-white/10 rounded-xl text-gray-400 shrink-0">
                {card.icon}
              </div>
              <div className="flex flex-col min-w-0 flex-1 space-y-2">
                <p className="text-xs font-bold text-gray-500  uppercase tracking-widest leading-none">
                  {card.label}
                </p>
                <p
                  className={` font-bold text-white leading-none truncate font-sans ${
                    card.isCapitalized ? "capitalize" : ""
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Genres (Kept separate due to edit state logic) */}
          <motion.div
            variants={itemVariants}
            layout
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-center hover:border-white/10 transition-colors overflow-hidden"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center justify-center w-11 h-11 bg-white/5 border border-white/10 rounded-xl text-gray-400 shrink-0">
                <Tags className="w-5 h-5" />
              </div>

              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <p className="text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-widest leading-none">
                  Genres
                </p>
                <AnimatePresence mode="popLayout">
                  {editingField !== "genres" && (
                    <motion.div
                      key="view-genres"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-2 flex-wrap"
                    >
                      {script?.genres && script.genres.length > 0 ? (
                        script.genres.map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/[0.04] text-gray-300 rounded-md text-xs font-semibold border border-white/10 font-sans tracking-wide"
                          >
                            {genre}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic text-sm font-sans">
                          None
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthor && editingField !== "genres" && (
                <button
                  onClick={() =>
                    handleEditClick("genres", script?.genres?.join(", ") || "")
                  }
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-transparent text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider ml-auto"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            <AnimatePresence>
              {editingField === "genres" && (
                <motion.div
                  key="edit-genres"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex flex-col gap-3 w-full"
                >
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Horror, Thriller..."
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-white/30 text-sm outline-none font-sans transition-colors"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <button
                      onClick={() => handleSave("genres")}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/10 text-[10px] font-bold text-white hover:bg-white/20 transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Languages (Kept separate due to edit state logic) */}
          <motion.div
            variants={itemVariants}
            layout
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-center hover:border-white/10 transition-colors overflow-hidden"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center justify-center w-11 h-11 bg-white/5 border border-white/10 rounded-xl text-gray-400 shrink-0">
                <Languages className="w-5 h-5" />
              </div>

              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <p className="text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-widest leading-none">
                  Languages
                </p>
                <AnimatePresence mode="popLayout">
                  {editingField !== "languages" && (
                    <motion.div
                      key="view-lang"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-2 flex-wrap"
                    >
                      {script?.languages && script.languages.length > 0 ? (
                        script.languages.map((language, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/[0.04] text-gray-300 rounded-md text-xs font-semibold border border-white/10 font-sans tracking-wide"
                          >
                            {language}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic text-sm font-sans">
                          None
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthor && editingField !== "languages" && (
                <button
                  onClick={() =>
                    handleEditClick(
                      "languages",
                      script?.languages?.join(", ") || "",
                    )
                  }
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-transparent text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider ml-auto"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            <AnimatePresence>
              {editingField === "languages" && (
                <motion.div
                  key="edit-lang"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex flex-col gap-3 w-full"
                >
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="English, Spanish..."
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-white/30 text-sm outline-none font-sans transition-colors"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <button
                      onClick={() => handleSave("languages")}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/10 text-[10px] font-bold text-white hover:bg-white/20 transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* --- Synopsis / Description Card --- */}
      </div>
    </motion.div>
  );
};

export default ScriptDetails;
