import React, { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Trash2, AlertTriangle, Lock, Globe2, Archive,
  Shield, Loader2, ListFilter, Users, X, Eye, FileMinus, UserMinus,
  MoreVertical, Check, Copy
} from "lucide-react";

import {
  DELETE_SCRIPT,
  UPDATE_SCRIPT,
  ADD_COLLABORATOR,
  REMOVE_COLLABORATOR,
  UPDATE_COLLABORATOR_ROLE,
  REMOVE_ALL_PARAGRAPHS,
  REMOVE_ALL_COLLABORATORS
} from "../../graphql/mutation/scriptMutations";

import Search from "../../components/layout/Search";
import Dropdown, { DropdownOption } from "../../components/layout/Dropdown";
import { useUserStore } from "../../store/useAuthStore";
import InviteCollaborator from "../../components/modal/InviteModal";
import { toast } from "sonner";

interface Collaborator {
  user: { id: string; name: string; };
  role: string;
}

interface ScriptContext {
  data?: {
    getScriptById?: {
      id: string;
      title?: string;
      description?: string;
      visibility?: string;
      author?: { id: string; name: string; };
      collaborators?: Collaborator[];
      paragraphs?: any[];
    };
  };
}

type VisibilityType = "Public" | "Private" | "Archived";

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

// --- Custom Kebab Menu for Member Actions ---
const MemberActionsDropdown = ({
  member,
  handleRoleChange,
  setConfirmingRemoveId,
}: {
  member: Collaborator;
  handleRoleChange: (id: string, role: any) => void;
  setConfirmingRemoveId: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-transparent hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 p-1.5 flex flex-col gap-2 top-full mt-2 w-48 bg-primary border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-0.5">
              <p className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</p>
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.id}
                  onClick={() => { handleRoleChange(member.user.id, role); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/10 flex items-center justify-between transition-colors ${member.role === role.id ? 'text-white font-bold bg-white/5' : 'text-gray-400'}`}
                >
                  {role.name}
                  {member.role === role.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>

            <div className="bg-white/10 w-full h-[1px]" />

            <button
              onClick={() => { setConfirmingRemoveId(member.user.id); setIsOpen(false); }}
              className="w-full text-left px-3 py-2  text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove Member
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DraftSettings: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useOutletContext<ScriptContext>();
  const script = data?.getScriptById;

  const { user } = useUserStore();
  const isAuthor = user?.id === script?.author?.id;

  const [visibility, setVisibility] = useState<VisibilityType>("Public");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(FILTER_OPTIONS[0]);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  // Danger Zone States
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingClearContent, setIsConfirmingClearContent] = useState(false);
  const [isConfirmingKickAll, setIsConfirmingKickAll] = useState(false);

  useEffect(() => {
    if (script?.visibility) setVisibility(script.visibility as VisibilityType);
  }, [script]);

  const [deleteScript, { loading: isDeleting }] = useMutation(DELETE_SCRIPT);
  const [updateScript] = useMutation(UPDATE_SCRIPT);
  const [removeCollaborator] = useMutation(REMOVE_COLLABORATOR);
  const [updateRole] = useMutation(UPDATE_COLLABORATOR_ROLE);
  const [removeAllParagraphs, { loading: isClearing }] = useMutation(REMOVE_ALL_PARAGRAPHS);
  const [removeAllCollaborators, { loading: isKicking }] = useMutation(REMOVE_ALL_COLLABORATORS);

  const allMembers = useMemo(() => {
    if (!script) return [];
    const owner: Collaborator = { user: { id: script.author?.id || "", name: script.author?.name || "Unknown" }, role: "OWNER" };
    const members = [owner, ...(script.collaborators || [])];

    return members.filter((member) => {
      const matchesSearch = member.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedFilter.id === "ALL" || member.role === selectedFilter.id;
      return matchesSearch && matchesRole;
    });
  }, [script, searchQuery, selectedFilter]);

  const handleVisibilityChange = async (newVisibility: VisibilityType) => {
    if (visibility === newVisibility || !script) return;
    setVisibility(newVisibility);
    const updatePromise = updateScript({
      variables: { scriptId: script.id, visibility: newVisibility, title: script.title, description: script.description },
    });
    toast.promise(updatePromise, { loading: "Updating...", success: `Draft is now ${newVisibility}!`, error: "Failed to update." });
  };

  const handleRoleChange = (targetUserId: string, newRole: any) => {
    if (!script) return;
    const rolePromise = updateRole({ variables: { scriptId: script.id, targetUserId, role: newRole.id } });
    toast.promise(rolePromise, { loading: "Updating role...", success: `Role updated to ${newRole.name}`, error: "Failed to update role" });
  };

  const handleRemoveCollab = (targetUserId: string) => {
    if (!script) return;
    const removePromise = removeCollaborator({ variables: { scriptId: script.id, targetUserId } });
    toast.promise(removePromise, { loading: "Removing...", success: () => { setConfirmingRemoveId(null); return "Member removed."; }, error: "Failed to remove." });
  };

  const handleClearContent = () => {
    if (!script) return;
    const promise = removeAllParagraphs({ variables: { scriptId: script.id } });
    toast.promise(promise, { loading: "Clearing draft...", success: () => { setIsConfirmingClearContent(false); return "Draft content cleared."; }, error: "Failed to clear content." });
  };

  const handleKickAll = () => {
    if (!script) return;
    const promise = removeAllCollaborators({ variables: { scriptId: script.id } });
    toast.promise(promise, { loading: "Removing all members...", success: () => { setIsConfirmingKickAll(false); return "All collaborators removed."; }, error: "Failed to remove members." });
  };

  const handleDelete = () => {
    if (!script) return;
    const deletePromise = deleteScript({ variables: { scriptId: script.id } });
    toast.promise(deletePromise, { loading: "Deleting draft...", success: () => { navigate("/explore"); return "Draft deleted."; }, error: "Failed to delete.", });
  };

  const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  const VISIBILITY_OPTIONS = [
    { id: "Public", icon: Globe2, title: "Public", description: "Anyone can view, read, and contribute.", activeClasses: { container: "border-white/40 bg-white/10", textIcon: "text-white", description: "text-gray-300" } },
    { id: "Private", icon: Lock, title: "Private", description: "Only Members can view and edit draft.", activeClasses: { container: "border-white/40 bg-white/10", textIcon: "text-white", description: "text-gray-300" } },
    { id: "Archived", icon: Archive, title: "Archived", description: "Frozen and read-only for everyone.", activeClasses: { container: "border-white/40 bg-white/10", textIcon: "text-white", description: "text-gray-300" } },
  ];

  if (!isAuthor) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl shadow-lg font-mono">
        <Lock className="w-8 h-8 text-gray-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400 text-sm">Only the original author can modify these settings.</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4 w-full font-mono">

      {/* ACCESS & VISIBILITY */}
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2"><Eye className="w-5 h-5" /> Access & Visibility</h2>
          <p className="text-sm text-gray-400 mt-1">Manage who can view and interact with this draft globally.</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {VISIBILITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = visibility === option.id;
            return (
              <label key={option.id} className={`flex gap-2 justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm group ${isActive ? option.activeClasses.container : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                <input type="radio" name="visibility" value={option.id} checked={isActive} onChange={() => handleVisibilityChange(option.id as VisibilityType)} className="sr-only" />
                <div className="flex flex-col">
                  <span className={`font-bold text-lg font-sans tracking-tight ${isActive ? option.activeClasses.textIcon : "text-gray-300"}`}>{option.title}</span>
                  <p className={`text-sm font-sans leading-relaxed ${isActive ? option.activeClasses.description : "text-gray-400"}`}>{option.description}</p>
                </div>
                <Icon className={`w-10 ${isActive ? option.activeClasses.textIcon : "text-gray-500"}`} />
              </label>
            );
          })}
        </div>
      </motion.div>

      {/* COLLABORATORS & ROLES */}
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-visible shadow-lg">
        {/* 🚨 FIXED: Invite Button perfectly aligned on the right of the heading */}
        <div className="p-4 border-b border-white/10 flex flex-col ">
          {/* <div> */}
          <h2 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2"><Shield className="w-5 h-5" /> Members & Roles</h2>
          <p className="text-sm text-gray-400 mt-1">Invite users and manage what they are allowed to do.</p>
          {/* </div> */}
          {/* <div className="shrink-0 w-full sm:w-auto">
            <InviteCollaborator scriptId={script!.id} />
          </div> */}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-6 w-full">
            <Search value={searchQuery} setSearch={setSearchQuery} placeholder="Search members..." />
            <Dropdown options={FILTER_OPTIONS} value={selectedFilter} onChange={setSelectedFilter} icon={ListFilter} collapseOnMobile={true} />
            <InviteCollaborator scriptId={script!.id} />
          </div>

          <div className="flex flex-col gap-3">
            {allMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <Users className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm font-mono">No members found.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {allMembers.map((member) => (
                  <motion.div key={member.user.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex items-center justify-between gap-3 sm:gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors">

                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">{member.user.name.charAt(0).toUpperCase()}</div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-bold text-white text-sm truncate max-w-[140px] sm:max-w-full">{member.user.name}</p>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">{member.role}</p>
                      </div>
                    </div>

                    {/* 🚨 FIXED: Action Area (Badges & 3 Dots) */}
                    <div className="flex items-center shrink-0">
                      {member.role === "OWNER" ? (
                        <span className="px-2 py-1 sm:px-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded uppercase tracking-widest">OWNER</span>
                      ) : (
                        confirmingRemoveId === member.user.id ? (
                          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 sm:gap-2">
                            <button onClick={() => setConfirmingRemoveId(null)} className="px-2 sm:px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"><X className="w-4 h-4 sm:hidden" /><span className="hidden sm:inline">Cancel</span></button>
                            <button onClick={() => handleRemoveCollab(member.user.id)} className="px-2 sm:px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"><Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Confirm</span></button>
                          </motion.div>
                        ) : (
                          <MemberActionsDropdown member={member} handleRoleChange={handleRoleChange} setConfirmingRemoveId={setConfirmingRemoveId} />
                        )
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* DANGER ZONE (Stacked List) */}
      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-red-900/30 rounded-2xl overflow-hidden shadow-lg relative">
        <div className="absolute top-0 left-0 w-full h-full bg-red-900/5 pointer-events-none" />

        {/* 🚨 FIXED: Strictly Left Aligned Text */}
        <div className="p-4 border-b border-red-900/30 relative z-10 text-left">
          <h2 className="text-lg font-bold text-red-500 flex items-center gap-2 font-sans tracking-tight justify-start"><AlertTriangle className="w-5 h-5" /> Danger Zone</h2>
          <p className="text-sm text-red-500/70 mt-1">Actions here cannot be undone. Please be certain.</p>
        </div>

        <div className="flex flex-col relative z-10 text-left">
          {/* Action 1: Clear All Content */}
          <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-red-900/30">
            <div className="w-full md:w-auto">
              <p className="font-bold text-white text-sm">Clear All Content</p>
              <p className="text-sm text-gray-400 mt-1 font-sans">Erase all paragraphs and contributions. This acts as a hard reset for the draft's text.</p>
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0 flex justify-start md:justify-end">
              <AnimatePresence mode="wait">
                {!isConfirmingClearContent ? (
                  <motion.button key="clear-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirmingClearContent(true)} className="px-6 py-2.5 border border-red-900/50 text-red-500 hover:bg-red-950/40 hover:border-red-500/50 rounded-xl font-bold transition-all text-sm shadow-sm active:scale-95 w-full md:w-auto">
                    Clear Content
                  </motion.button>
                ) : (
                  <motion.div key="confirm-clear" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setIsConfirmingClearContent(false)} className="flex-1 md:flex-none px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl font-bold transition-colors text-sm active:scale-95">Cancel</button>
                    <button onClick={handleClearContent} disabled={isClearing} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg text-sm active:scale-95"><FileMinus className="w-4 h-4" /> {isClearing ? "Clearing..." : "Yes, Clear It"}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action 2: Remove All Members */}
          {script?.collaborators && script.collaborators.length > 0 && (
            <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-red-900/30">
              <div className="w-full md:w-auto">
                <p className="font-bold text-white text-sm">Remove All Members</p>
                <p className="text-sm text-gray-400 mt-1 font-sans">Kick all invited collaborators at once. The draft will remain but only you will have access.</p>
              </div>
              <div className="w-full md:w-auto mt-2 md:mt-0 flex justify-start md:justify-end">
                <AnimatePresence mode="wait">
                  {!isConfirmingKickAll ? (
                    <motion.button key="kick-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirmingKickAll(true)} className="px-6 py-2.5 border border-red-900/50 text-red-500 hover:bg-red-950/40 hover:border-red-500/50 rounded-xl font-bold transition-all text-sm shadow-sm active:scale-95 w-full md:w-auto">
                      Remove Members
                    </motion.button>
                  ) : (
                    <motion.div key="confirm-kick" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 w-full md:w-auto">
                      <button onClick={() => setIsConfirmingKickAll(false)} className="flex-1 md:flex-none px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl font-bold transition-colors text-sm active:scale-95">Cancel</button>
                      <button onClick={handleKickAll} disabled={isKicking} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg text-sm active:scale-95"><UserMinus className="w-4 h-4" /> {isKicking ? "Removing..." : "Yes, Kick All"}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Action 3: Delete Draft */}
          <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <p className="font-bold text-white text-sm">Delete this Draft</p>
              <p className="text-sm text-gray-400 mt-1 font-sans">Once deleted, there is no going back. All text and members will be erased forever.</p>
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0 flex justify-start md:justify-end">
              <AnimatePresence mode="wait">
                {!isConfirmingDelete ? (
                  <motion.button key="delete-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirmingDelete(true)} className="px-6 py-2.5 border border-red-900/50 text-red-500 hover:bg-red-950/40 hover:border-red-500/50 rounded-xl font-bold transition-all text-sm shadow-sm active:scale-95 w-full md:w-auto">
                    Delete Draft
                  </motion.button>
                ) : (
                  <motion.div key="confirm-delete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 md:flex-none px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl font-bold transition-colors text-sm active:scale-95">Cancel</button>
                    <button onClick={handleDelete} disabled={isDeleting} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg text-sm active:scale-95"><Trash2 className="w-4 h-4" /> {isDeleting ? "Deleting..." : "Yes, Delete It"}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default DraftSettings;