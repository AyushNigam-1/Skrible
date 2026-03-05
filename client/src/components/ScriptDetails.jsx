import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation } from "@apollo/client";
import useElementHeight from "../hooks/useElementOffset";
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
import Loader from "./Loader";
import { UPDATE_SCRIPT } from "../graphql/mutation/scriptMutations";

const ScriptDetails = () => {
  const { data, loading, refetch } = useOutletContext();
  const height = useElementHeight("details");
  const script = data?.getScriptById;

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAuthor = currentUser?.id !== script?.author?.id;

  const [updateScript, { loading: isUpdating }] = useMutation(UPDATE_SCRIPT);

  // Edit States
  const [editingField, setEditingField] = useState(null); // 'description', 'genres', or 'languages'
  const [editValue, setEditValue] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea when editing description
  useEffect(() => {
    if (editingField === "description" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, editingField]);

  const handleEditClick = (field, initialValue) => {
    setEditingField(field);
    setEditValue(initialValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSave = async (field) => {
    try {
      let variables = { scriptId: script.id };

      if (field === "description") variables.description = editValue;
      if (field === "genres")
        variables.genres = editValue.split(",").map((g) => g.trim());
      if (field === "languages")
        variables.languages = editValue.split(",").map((l) => l.trim());

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
      <div
        className="flex justify-center items-center w-full"
        style={{ height: "70vh" }}
      >
        <Loader />
      </div>
    );
  }

  const formatDate = (isoString) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(Number(isoString));
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div
      id="details"
      className="w-full mx-auto overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 scrollbar-thumb-rounded-full font-mono animate-in fade-in duration-500 pb-10"
    >
      <div className="flex flex-col gap-6">
        {/* --- Synopsis / Description Card --- */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              Synopsis
            </h3>
            {isAuthor && editingField !== "description" && (
              <button
                onClick={() =>
                  handleEditClick("description", script?.description || "")
                }
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md border border-white/10 hover:bg-white/10"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {editingField === "description" ? (
            <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-white/50 focus:border-white/50 outline-none transition-all resize-none overflow-hidden text-lg leading-relaxed placeholder-gray-600 font-['Literata']"
                placeholder="Write the synopsis..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave("description")}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-5 py-1.5 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 leading-relaxed text-lg font-['Literata']">
              {script?.description || "No description provided for this draft."}
            </p>
          )}
        </div>

        {/* --- Metadata Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group">
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
                Original Author
              </p>
              <p className="text-lg font-bold text-white">
                @{script?.author?.username}
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group">
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
                Created On
              </p>
              <p className="text-lg font-bold text-white">
                {formatDate(script?.createdAt)}
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group">
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              {script?.visibility === "Public" ? (
                <Globe className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
                Visibility
              </p>
              <p className="text-lg font-bold text-white capitalize">
                {script?.visibility}
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-start gap-4 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group">
            <div className="bg-white/5 border border-white/20 p-3 rounded-xl text-white shrink-0 shadow-sm group-hover:bg-white group-hover:text-black transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
                Approved Contributions
              </p>
              <p className="text-lg font-bold text-white">
                {script?.paragraphs?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* --- Classification / Tags --- */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
          {/* Genres */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="flex items-center gap-2 text-md font-bold text-white">
                <Tags className="w-4 h-4 text-gray-400" /> Genres
              </h3>
              {isAuthor && editingField !== "genres" && (
                <button
                  onClick={() =>
                    handleEditClick("genres", script?.genres?.join(", ") || "")
                  }
                  className="text-xs text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {editingField === "genres" ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Fantasy, Mystery, Sci-Fi..."
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-1 focus:ring-white/50 text-sm outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave("genres")}
                    disabled={isUpdating}
                    className="text-xs bg-white text-black px-3 py-1 rounded-md font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {script?.genres?.length > 0 ? (
                  script.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-bold border border-white/10 shadow-sm hover:bg-white/10 transition-colors"
                    >
                      # {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-sm">
                    No genres specified
                  </span>
                )}
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Languages */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="flex items-center gap-2 text-md font-bold text-white">
                <Languages className="w-4 h-4 text-gray-400" /> Languages
              </h3>
              {isAuthor && editingField !== "languages" && (
                <button
                  onClick={() =>
                    handleEditClick(
                      "languages",
                      script?.languages?.join(", ") || "",
                    )
                  }
                  className="text-xs text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {editingField === "languages" ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="English, Spanish, French..."
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-1 focus:ring-white/50 text-sm outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave("languages")}
                    disabled={isUpdating}
                    className="text-xs bg-white text-black px-3 py-1 rounded-md font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {script?.languages?.length > 0 ? (
                  script.languages.map((language, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm font-bold border border-white/20 shadow-sm hover:bg-white/20 transition-colors"
                    >
                      {language}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-sm">
                    No languages specified
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptDetails;
