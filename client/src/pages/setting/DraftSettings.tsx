import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Trash2,
  AlertTriangle,
  Lock,
  Globe2,
  Archive,
  UserPlus,
  Shield,
  X,
  Loader2,
} from "lucide-react";

// Assuming you have these exported from your frontend mutations file
import {
  DELETE_SCRIPT,
  UPDATE_SCRIPT,
  ADD_COLLABORATOR,
  REMOVE_COLLABORATOR,
  UPDATE_COLLABORATOR_ROLE,
} from "../../graphql/mutation/scriptMutations";

// --- Types ---
interface Collaborator {
  user: {
    id: string;
    name: string;
  };
  role: string;
}

interface ScriptContext {
  data?: {
    getScriptById?: {
      id: string;
      title?: string;
      description?: string;
      visibility?: string;
      author?: {
        id: string;
        name: string;
      };
      collaborators?: Collaborator[];
    };
  };
}

interface StoredUser {
  id: string;
  name: string;
}

type VisibilityType = "Public" | "Private" | "Archived";
type RoleType = "EDITOR" | "CONTRIBUTOR" | "VIEWER";

const DraftSettings: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useOutletContext<ScriptContext>();
  const script = data?.getScriptById;
  console.log(script);
  const storedUser = localStorage.getItem("user");
  const currentUser: StoredUser | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  // Security check: Only the Original Author (OWNER) can access settings
  const isAuthor = currentUser?.id !== script?.author?.id;

  const [visibility, setVisibility] = useState<VisibilityType>("Public");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Collaboration State
  const [invitename, setInvitename] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleType>("CONTRIBUTOR");

  useEffect(() => {
    if (script?.visibility) {
      setVisibility(script.visibility as VisibilityType);
    }
  }, [script]);

  // Mutations
  const [deleteScript, { loading: isDeleting }] = useMutation(DELETE_SCRIPT);
  const [updateScript] = useMutation(UPDATE_SCRIPT);
  const [addCollaborator, { loading: isAddingCollab }] =
    useMutation(ADD_COLLABORATOR);
  const [removeCollaborator] = useMutation(REMOVE_COLLABORATOR);
  const [updateRole] = useMutation(UPDATE_COLLABORATOR_ROLE);

  // --- Handlers ---
  const handleVisibilityChange = async (newVisibility: VisibilityType) => {
    if (visibility === newVisibility || !script) return;
    setVisibility(newVisibility);
    try {
      await updateScript({
        variables: {
          scriptId: script.id,
          visibility: newVisibility,
        },
      });
    } catch (err) {
      console.error("Failed to update visibility:", err);
      if (script.visibility) setVisibility(script.visibility as VisibilityType);
      alert("Failed to update visibility. Please try again.");
    }
  };

  const handleInvite = async () => {
    if (!invitename.trim() || !script) return;
    try {
      await addCollaborator({
        variables: {
          scriptId: script.id,
          name: invitename.trim(),
          role: inviteRole,
        },
      });
      setInvitename(""); // Clear input on success
    } catch (err: any) {
      console.error(err);
      alert(
        err.message || "Failed to invite user. Check if name is correct.",
      );
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!script) return;
    try {
      await updateRole({
        variables: {
          scriptId: script.id,
          targetUserId,
          role: newRole,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update role.");
    }
  };

  const handleRemoveCollab = async (targetUserId: string) => {
    if (!script) return;
    try {
      await removeCollaborator({
        variables: {
          scriptId: script.id,
          targetUserId,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to remove collaborator.");
    }
  };

  const handleDelete = async () => {
    if (!script) return;
    try {
      await deleteScript({ variables: { scriptId: script.id } });
      navigate("/explore");
    } catch (err) {
      console.error("Failed to delete script:", err);
      alert("Failed to delete the draft. Please try again.");
    }
  };

  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (!isAuthor) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl shadow-lg font-mono"
      >
        <Lock className="w-8 h-8 text-gray-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400 text-sm">
          Only the original author can modify these settings.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 w-full font-mono pb-10"
    >
      {/* --- ACCESS & VISIBILITY --- */}
      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            Access & Visibility
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage who can view and interact with this draft globally.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Public Option */}
            <label
              className={`flex flex-col items-start p-5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm group ${visibility === "Public" ? "border-white/40 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"}`}
            >
              <input
                type="radio"
                name="visibility"
                value="Public"
                checked={visibility === "Public"}
                onChange={() => handleVisibilityChange("Public")}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-2">
                <Globe2
                  className={`w-5 h-5 ${visibility === "Public" ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}
                />
                <span
                  className={`font-bold text-lg font-sans tracking-tight ${visibility === "Public" ? "text-white" : "text-gray-300"}`}
                >
                  Public
                </span>
              </div>
              <p className="text-sm text-gray-500 font-sans leading-relaxed">
                Anyone can view, read, and request to contribute.
              </p>
            </label>

            {/* Private Option */}
            <label
              className={`flex flex-col items-start p-5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm group ${visibility === "Private" ? "border-white/40 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"}`}
            >
              <input
                type="radio"
                name="visibility"
                value="Private"
                checked={visibility === "Private"}
                onChange={() => handleVisibilityChange("Private")}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-2">
                <Lock
                  className={`w-5 h-5 ${visibility === "Private" ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}
                />
                <span
                  className={`font-bold text-lg font-sans tracking-tight ${visibility === "Private" ? "text-white" : "text-gray-300"}`}
                >
                  Private
                </span>
              </div>
              <p className="text-sm text-gray-500 font-sans leading-relaxed">
                Only you and invited members can view and edit this draft.
              </p>
            </label>

            {/* Archived Option */}
            <label
              className={`flex flex-col items-start p-5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm group ${visibility === "Archived" ? "border-amber-500/40 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]" : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"}`}
            >
              <input
                type="radio"
                name="visibility"
                value="Archived"
                checked={visibility === "Archived"}
                onChange={() => handleVisibilityChange("Archived")}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-2">
                <Archive
                  className={`w-5 h-5 ${visibility === "Archived" ? "text-amber-400" : "text-gray-500 group-hover:text-gray-300"}`}
                />
                <span
                  className={`font-bold text-lg font-sans tracking-tight ${visibility === "Archived" ? "text-amber-400" : "text-gray-300"}`}
                >
                  Archived
                </span>
              </div>
              <p className="text-sm text-gray-500 font-sans leading-relaxed">
                Hidden from explore. Frozen and read-only for everyone.
              </p>
            </label>
          </div>
        </div>
      </motion.div>

      {/* --- COLLABORATORS & ROLES --- */}
      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Collaborators & Roles
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Invite users and manage what they are allowed to do.
          </p>
        </div>

        <div className="p-6">
          {/* Invite Form */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                @
              </span>
              <input
                type="text"
                placeholder="name"
                value={invitename}
                onChange={(e) => setInvitename(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-white/50 text-sm outline-none shadow-inner"
              />
            </div>
            <div className="w-full sm:w-40 relative">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as RoleType)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-white/50 text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="EDITOR" className="bg-[#13151a]">
                  Editor
                </option>
                <option value="CONTRIBUTOR" className="bg-[#13151a]">
                  Contributor
                </option>
                <option value="VIEWER" className="bg-[#13151a]">
                  Viewer
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleInvite}
              disabled={isAddingCollab || !invitename.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              {isAddingCollab ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Invite
            </button>
          </div>

          {/* Collaborator List */}
          <div className="flex flex-col gap-3">
            {script?.collaborators?.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
                No collaborators yet.
              </div>
            ) : (
              <AnimatePresence>
                {script?.collaborators?.map((collab) => (
                  <motion.div
                    key={collab.user.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold shrink-0">
                        {collab.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">
                          @{collab.user.name}
                        </p>
                        {collab.role === "OWNER" && (
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                            Creator
                          </p>
                        )}
                      </div>
                    </div>

                    {collab.role === "OWNER" ? (
                      <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-lg tracking-widest self-start sm:self-auto">
                        OWNER
                      </span>
                    ) : (
                      <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <select
                            value={collab.role}
                            onChange={(e) =>
                              handleRoleChange(collab.user.id, e.target.value)
                            }
                            className="appearance-none w-full sm:w-auto px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-gray-200 focus:text-white focus:ring-1 focus:ring-white/50 text-xs font-bold outline-none cursor-pointer tracking-wider transition-colors pr-8"
                          >
                            <option value="EDITOR" className="bg-[#13151a]">
                              Editor
                            </option>
                            <option
                              value="CONTRIBUTOR"
                              className="bg-[#13151a]"
                            >
                              Contributor
                            </option>
                            <option value="VIEWER" className="bg-[#13151a]">
                              Viewer
                            </option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveCollab(collab.user.id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition-all shrink-0"
                          title="Block / Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* --- DANGER ZONE --- */}
      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-red-900/30 rounded-2xl overflow-hidden shadow-lg relative"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-red-900/5 pointer-events-none" />

        <div className="p-6 border-b border-red-900/30 relative z-10">
          <h2 className="text-lg font-bold text-red-500 flex items-center gap-2 font-sans tracking-tight">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-red-500/70 mt-1">
            Actions here cannot be undone. Please be certain.
          </p>
        </div>

        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 min-h-[100px]">
          <div className="w-full md:w-auto text-center md:text-left">
            <p className="font-bold text-white text-sm">Delete this Draft</p>
            <p className="text-sm text-gray-400 mt-1 font-sans">
              Once you delete a draft, there is no going back. All paragraphs
              and comments will be erased forever.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isConfirmingDelete ? (
              <motion.button
                key="delete-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.15 },
                }}
                onClick={() => setIsConfirmingDelete(true)}
                className="shrink-0 px-6 py-2.5 border border-red-900/50 text-red-500 hover:bg-red-950/40 hover:border-red-500/50 rounded-xl font-bold transition-all text-sm shadow-sm active:scale-95"
              >
                Delete Draft
              </motion.button>
            ) : (
              <motion.div
                key="confirm-btns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                className="flex items-center gap-3 shrink-0"
              >
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl font-bold transition-colors text-sm active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg text-sm active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Yes, Delete It"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DraftSettings;
