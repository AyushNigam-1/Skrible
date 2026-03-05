import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Trash2, AlertTriangle, Lock, Globe2 } from "lucide-react";
import {
  DELETE_SCRIPT,
  UPDATE_SCRIPT,
} from "../../graphql/mutation/scriptMutations";

const DraftSettings = () => {
  const navigate = useNavigate();
  const { data } = useOutletContext();
  const script = data?.getScriptById;

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAuthor = currentUser?.id !== script?.author?.id;

  const [visibility, setVisibility] = useState("Public");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (script) {
      setVisibility(script.visibility || "Public");
    }
  }, [script]);

  const [deleteScript, { loading: isDeleting }] = useMutation(DELETE_SCRIPT);
  const [updateScript] = useMutation(UPDATE_SCRIPT);

  // Triggered immediately when a user clicks a visibility option
  const handleVisibilityChange = async (newVisibility) => {
    if (visibility === newVisibility) return; // Don't trigger if already selected

    setVisibility(newVisibility); // Optimistically update UI

    try {
      await updateScript({
        variables: {
          scriptId: script.id,
          title: script.title,
          description: script.description,
          visibility: newVisibility,
        },
      });
    } catch (err) {
      console.error("Failed to update visibility:", err);
      // Revert the optimistic update on failure
      setVisibility(script.visibility);
      alert("Failed to update visibility. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteScript({ variables: { scriptId: script.id } });
      navigate("/explore");
    } catch (err) {
      console.error("Failed to delete script:", err);
      alert("Failed to delete the draft. Please try again.");
    }
  };

  if (!isAuthor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl shadow-lg font-mono">
        <Lock className="w-8 h-8 text-gray-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400 text-sm">
          Only the author can modify these settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full  font-mono animate-in fade-in duration-500">
      {/* --- ACCESS SETTINGS --- */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Access & Visibility
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage who can view and contribute to this draft.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                visibility === "Public"
                  ? "border-white/40 bg-white/10"
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="Public"
                checked={visibility === "Public"}
                onChange={() => handleVisibilityChange("Public")}
                className="mt-1 sr-only"
              />
              <Globe2
                className={`w-5 h-5 ${
                  visibility === "Public" ? "text-white" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`font-bold text-sm ${
                    visibility === "Public" ? "text-white" : "text-gray-300"
                  }`}
                >
                  Public
                </p>
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  Anyone can view and request to contribute.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                visibility === "Private"
                  ? "border-white/40 bg-white/10"
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="Private"
                checked={visibility === "Private"}
                onChange={() => handleVisibilityChange("Private")}
                className="mt-1 sr-only"
              />
              <Lock
                className={`w-5 h-5 ${
                  visibility === "Private" ? "text-white" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`font-bold text-sm ${
                    visibility === "Private" ? "text-white" : "text-gray-300"
                  }`}
                >
                  Private
                </p>
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  Only you can view and edit this draft.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* --- DANGER ZONE --- */}
      <div className="bg-white/5 backdrop-blur-xl border border-red-900/30 rounded-2xl overflow-hidden shadow-lg relative">
        <div className="absolute top-0 left-0 w-full h-full bg-red-900/5 pointer-events-none" />

        <div className="p-6 border-b border-red-900/30 relative z-10">
          <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-red-500/70 mt-1">
            Actions here cannot be undone. Please be certain.
          </p>
        </div>

        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <p className="font-bold text-white text-sm">Delete this Draft</p>
            <p className="text-sm text-gray-400 mt-1 font-sans">
              Once you delete a draft, there is no going back. All paragraphs
              and comments will be erased forever.
            </p>
          </div>

          {!isConfirmingDelete ? (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="shrink-0 px-5 py-2.5 border border-red-900/50 text-red-500 hover:bg-red-950/30 hover:border-red-500/50 rounded-lg font-bold transition-colors text-sm shadow-sm"
            >
              Delete Draft
            </button>
          ) : (
            <div className="flex items-center gap-3 shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg font-bold transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 shadow-lg text-sm"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Yes, Delete It"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftSettings;
