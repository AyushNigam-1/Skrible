import React, { useState, useEffect, useMemo, Fragment } from "react";
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
  Loader2,
  ListFilter,
  Users,
  X,
  Eye
} from "lucide-react";

import {
  DELETE_SCRIPT,
  UPDATE_SCRIPT,
  ADD_COLLABORATOR,
  REMOVE_COLLABORATOR,
  UPDATE_COLLABORATOR_ROLE,
} from "../../graphql/mutation/scriptMutations";

// --- Components ---
import Search from "../../components/layout/Search";
import Dropdown, { DropdownOption } from "../../components/layout/Dropdown";
import { useUserStore } from "../../store/useAuthStore";
import { Dialog, DialogPanel } from "@headlessui/react";
import InviteCollaborator from "../../components/modal/InviteModal";
import { toast } from "sonner";

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

type VisibilityType = "Public" | "Private" | "Archived";

// --- Constants ---
const ROLE_OPTIONS = [
  { id: "EDITOR", name: "Editor" },
  { id: "CONTRIBUTOR", name: "Contributor" },
  { id: "VIEWER", name: "Viewer" },
];

const FILTER_OPTIONS = [
  { id: "ALL", name: "All Roles" },
  { id: "OWNER", name: "Owner" },
  ...ROLE_OPTIONS,
];

const DraftSettings: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useOutletContext<ScriptContext>();
  const script = data?.getScriptById;

  const { user } = useUserStore();
  const isAuthor = user?.id === script?.author?.id;

  const [visibility, setVisibility] = useState<VisibilityType>("Public");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitename, setInvitename] = useState("");
  const [inviteRole, setInviteRole] = useState<DropdownOption>(ROLE_OPTIONS[1]); // Default to Contributor
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(FILTER_OPTIONS[0]);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    if (script?.visibility) {
      setVisibility(script.visibility as VisibilityType);
    }
  }, [script]);

  // Mutations
  const [deleteScript, { loading: isDeleting }] = useMutation(DELETE_SCRIPT);
  const [updateScript] = useMutation(UPDATE_SCRIPT);
  const [addCollaborator, { loading: isAddingCollab }] = useMutation(ADD_COLLABORATOR);
  const [removeCollaborator] = useMutation(REMOVE_COLLABORATOR);
  const [updateRole] = useMutation(UPDATE_COLLABORATOR_ROLE);

  // --- Derived State: Combine Owner + Collaborators ---
  const allMembers = useMemo(() => {
    if (!script) return [];

    const owner: Collaborator = {
      user: { id: script.author?.id || "", name: script.author?.name || "Unknown" },
      role: "OWNER",
    };

    const members = [owner, ...(script.collaborators || [])];

    return members.filter((member) => {
      const matchesSearch = member.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedFilter.id === "ALL" || member.role === selectedFilter.id;
      return matchesSearch && matchesRole;
    });
  }, [script, searchQuery, selectedFilter]);

  // --- Handlers ---
  const handleVisibilityChange = async (newVisibility: VisibilityType) => {
    if (visibility === newVisibility || !script) return;
    setVisibility(newVisibility);
    const updatePromise = updateScript({
      variables: {
        scriptId: script.id,
        visibility: newVisibility,
        title: script.title,
        description: script.description
      },
    })

    toast.promise(
      updatePromise,
      {
        loading: "Updating visibility...",
        success: `Draft is now ${newVisibility}!`,
        error: "Failed to update visibility.",
      }
    );

  };

  const handleInvite = async () => {
    if (!invitename.trim() || !script) return;
    try {
      await addCollaborator({
        variables: {
          scriptId: script.id,
          name: invitename.trim(),
          role: inviteRole.id,
        },
      });
      setInvitename("");
      setIsInviteModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to invite user. Check if name is correct.");
    }
  };

  const handleRoleChange = (targetUserId: string, newRole: any) => {
    if (!script) return;

    const rolePromise = updateRole({
      variables: {
        scriptId: script.id,
        targetUserId,
        role: newRole.id,
      },
    });

    toast.promise(rolePromise, {
      loading: `Updating role to ${newRole.name}...`,
      success: `Role updated to ${newRole.name}`,
      error: (err) => err.message || "Failed to update role",
    });
  };

  const handleRemoveCollab = (targetUserId: string) => {
    if (!script) return;

    const removePromise = removeCollaborator({
      variables: { scriptId: script.id, targetUserId },
    });

    toast.promise(removePromise, {
      loading: "Removing collaborator...",
      success: () => {
        setConfirmingRemoveId(null);
        return "Member successfully removed.";
      },
      error: "Failed to remove collaborator.",
    });
  };

  const handleDelete = () => {
    if (!script) return;

    const deletePromise = deleteScript({
      variables: { scriptId: script.id }
    });

    toast.promise(deletePromise, {
      loading: "Deleting draft permanently...",
      success: () => {
        navigate("/explore");
        return "Draft deleted.";
      },
      error: "Failed to delete the draft. Please try again.",
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const VISIBILITY_OPTIONS = [
    {
      id: "Public",
      icon: Globe2,
      title: "Public",
      description: "Anyone can view, read, and contribute.",
      activeClasses: {
        container: "border-white/40 bg-white/10",
        textIcon: "text-white",
        description: "text-gray-300",
      },
    },
    {
      id: "Private",
      icon: Lock,
      title: "Private",
      description: "Invited members can view and edit draft.",
      activeClasses: {
        container: "border-white/40 bg-white/10",
        textIcon: "text-white",
        description: "text-gray-300",
      },
    },
    {
      id: "Archived",
      icon: Archive,
      title: "Archived",
      description: "Frozen and read-only for everyone.",
      activeClasses: {
        container: "border-white/40 bg-white/10",
        textIcon: "text-white",
        description: "text-gray-300",
      },
    },
  ];

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
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 w-full font-mono"
      >
        {/* --- ACCESS & VISIBILITY --- */}
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Access & Visibility
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage who can view and interact with this draft globally.
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {VISIBILITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = visibility === option.id;

              return (
                <label
                  key={option.id}
                  className={`flex gap-2 justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm group ${isActive
                    ? option.activeClasses.container
                    : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.id}
                    checked={isActive}
                    onChange={() => handleVisibilityChange(option.id as VisibilityType)}
                    className="sr-only"
                  />

                  <div className="flex flex-col">

                    <span
                      className={`font-bold text-lg font-sans tracking-tight ${isActive ? option.activeClasses.textIcon : "text-gray-300"
                        }`}
                    >
                      {option.title}
                    </span>
                    <p
                      className={`text-sm font-sans leading-relaxed ${isActive ? option.activeClasses.description : "text-gray-400"
                        }`}
                    >
                      {option.description}
                    </p>
                  </div>
                  <Icon
                    className={`w-10 ${isActive
                      ? option.activeClasses.textIcon
                      : "text-gray-500"
                      }`}
                  />
                </label>
              );
            })}
          </div>

        </motion.div>

        {/* --- COLLABORATORS & ROLES --- */}
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-visible shadow-lg">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="w-full sm:w-72">
                <Search value={searchQuery}
                  setSearch={setSearchQuery} placeholder="Search members..." />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Dropdown
                  options={FILTER_OPTIONS}
                  value={selectedFilter}
                  onChange={setSelectedFilter}
                  icon={ListFilter}
                  className="w-full sm:w-max shrink-0"
                />

                <InviteCollaborator scriptId={script!.id} />
              </div>
            </div>

            {/* --- MEMBER LIST --- */}
            <div className="flex flex-col gap-3">
              {allMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                  <Users className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-gray-500 text-sm font-mono">No members found.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {allMembers.map((member) => (
                    <motion.div
                      key={member.user.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-white text-sm">
                            {member.user.name}
                          </p>
                          {member.role === "OWNER" && (
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">
                              Creator
                            </p>
                          )}
                        </div>
                      </div>

                      {member.role === "OWNER" ? (
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded uppercase tracking-widest self-start sm:self-auto">
                          OWNER
                        </span>
                      ) : (
                        <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">

                          {/* 🚨 INLINE CONFIRMATION STATE */}
                          {confirmingRemoveId === member.user.id ? (
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2 w-full sm:w-auto"
                            >
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest mr-1 hidden sm:block">
                                Remove user?
                              </span>
                              <button
                                onClick={() => setConfirmingRemoveId(null)}
                                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRemoveCollab(member.user.id)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Confirm
                              </button>
                            </motion.div>
                          ) : (
                            <>
                              <Dropdown
                                value={ROLE_OPTIONS.find(r => r.id === member.role) || ROLE_OPTIONS[2]}
                                onChange={(opt) => handleRoleChange(member.user.id, opt)}
                                options={ROLE_OPTIONS}
                                className="flex-1 "
                              />
                              <button
                                onClick={() => setConfirmingRemoveId(member.user.id)}
                                className="flex items-center justify-center p-2.5  border-red-400/30 text-red-400 bg-red-500/10 border s hover:border-red-500/20 rounded-lg transition-all shrink-0"
                                title="Remove User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

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
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-red-900/30 rounded-2xl overflow-hidden shadow-lg relative">
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
                Once you delete a draft, there is no going back. All paragraphs and comments will be erased forever.
              </p>
            </div>
            <AnimatePresence mode="wait">
              {!isConfirmingDelete ? (
                <motion.button
                  key="delete-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
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
      </motion.div >
    </>
  );
};

export default DraftSettings;