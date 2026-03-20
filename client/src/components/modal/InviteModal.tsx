import { useState, Fragment, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Dialog, DialogPanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, ChevronDown, Check } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "CONTRIBUTOR", label: "Contributor" },
  { value: "EDITOR", label: "Editor" },
  { value: "VIEWER", label: "Viewer" },
];

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      username
      image
    }
  }
`;

const ADD_COLLABORATOR = gql`
  mutation AddCollaborator($scriptId: ID!, $identifier: String!, $role: String!) {
    addCollaborator(scriptId: $scriptId, identifier: $identifier, role: $role) {
      id
    }
  }
`;

interface InviteCollaboratorProps {
  scriptId: string;
}

export default function InviteCollaborator({ scriptId }: InviteCollaboratorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [emailTerm, setEmailTerm] = useState("");
  const [focusedInput, setFocusedInput] = useState<"username" | "email" | null>(null);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteRole, setInviteRole] = useState(ROLE_OPTIONS[0].value);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTerm);

  const activeTerm = focusedInput === "email" ? emailTerm : searchTerm;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(activeTerm), 300);
    return () => clearTimeout(timer);
  }, [activeTerm]);

  const { data: searchData, loading: searchLoading, error: searchError } = useQuery(SEARCH_USERS, {
    variables: { query: debouncedTerm },
    skip: debouncedTerm.length < 2,
    fetchPolicy: "network-only",
  });

  // 🚨 Tripwire for backend errors
  useEffect(() => {
    if (searchError) {
      console.error("🚨 SEARCH ERROR FROM BACKEND:", searchError.message);
    }
  }, [searchError]);

  const [addCollaborator, { loading: isAddingCollab }] = useMutation(ADD_COLLABORATOR, {
    onCompleted: () => {
      console.log("Invite sent successfully!");
      handleClose();
    },
    onError: (err) => {
      console.error("Failed to send invite:", err.message);
      alert(err.message);
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFocusedInput("username");
    setSelectedUser(null);
    if (emailTerm) setEmailTerm("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailTerm(e.target.value);
    setFocusedInput("email");
    setSelectedUser(null);
    if (searchTerm) setSearchTerm("");
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchTerm(`@${user.username}`);
    setEmailTerm("");
    setFocusedInput("username");
  };

  const handleInvite = () => {
    const identifierToSend = selectedUser ? selectedUser.username : emailTerm;

    if (!identifierToSend) return;

    addCollaborator({
      variables: {
        scriptId,
        identifier: identifierToSend,
        role: inviteRole
      }
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setEmailTerm("");
    setFocusedInput(null);
    setSelectedUser(null);
    setInviteRole(ROLE_OPTIONS[0].value);
  };

  const searchResults = searchData?.searchUsers || [];
  const canSubmit = selectedUser || isValidEmail;
  const selectedRoleObj = ROLE_OPTIONS.find(r => r.value === inviteRole) || ROLE_OPTIONS[0];

  const renderDropdown = () => (
    <div className="absolute top-[70px] left-0 right-0 bg-[#1e1e2d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
      {searchLoading ? (
        <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Searching...
        </div>
      ) : searchError ? ( // 🚨 VISUALLY SHOW IF THE BACKEND CRASHED
        <div className="p-4 text-center text-red-400 text-sm">
          Error: {searchError.message}
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          {focusedInput === "email" && isValidEmail
            ? "Valid email. Press Invite to send."
            : "No users found."}
        </div>
      ) : (
        searchResults.map((u: any) => (
          <button
            key={u.id}
            onClick={() => handleSelectUser(u)}
            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left outline-none border-b border-white/5 last:border-0"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-sans overflow-hidden shrink-0">
              {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-white font-sans font-semibold">{u.name}</span>
              <span className="text-xs text-gray-500">@{u.username}</span>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <Fragment>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-sans text-sm transition-colors border border-white/5 font-semibold"
      >
        <Plus className="w-4 h-4" />
        Invite
      </button>

      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel as={Fragment}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full max-w-[500px] bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl flex flex-col font-sans"
                >
                  <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <Dialog.Title as="h3" className="text-xl font-bold text-white tracking-tight">
                      Invite Collaborator
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col gap-5">

                    <div className="flex flex-col gap-2 relative z-30">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Username
                      </label>
                      <input
                        type="text"
                        placeholder="Search name or username..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setFocusedInput("username")}
                        className="w-full px-4 py-3 bg-[#161620] border border-white/5 rounded-xl text-white outline-none focus:border-white/20 transition-all text-sm"
                      />
                      {focusedInput === "username" && searchTerm.length >= 2 && !selectedUser && renderDropdown()}
                    </div>

                    <div className="flex items-center gap-4 py-1">
                      <hr className="flex-1 border-white/5" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">OR</span>
                      <hr className="flex-1 border-white/5" />
                    </div>

                    <div className="flex flex-col gap-2 relative z-20">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="colleague@example.com"
                        value={emailTerm}
                        onChange={handleEmailChange}
                        onFocus={() => setFocusedInput("email")}
                        className="w-full px-4 py-3 bg-[#161620] border border-white/5 rounded-xl text-white outline-none focus:border-white/20 transition-all text-sm"
                      />
                      {focusedInput === "email" && emailTerm.length >= 2 && !selectedUser && renderDropdown()}
                    </div>

                    <div className="flex flex-col gap-2 relative z-10 mt-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Role
                      </label>
                      <Listbox value={inviteRole} onChange={setInviteRole}>
                        <div className="relative">
                          <ListboxButton className="w-full flex items-center justify-between px-4 py-3 bg-[#161620] border border-white/5 rounded-xl text-white outline-none focus:border-white/20 transition-all text-sm cursor-pointer">
                            <span className="block truncate">{selectedRoleObj.label}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
                          </ListboxButton>

                          <ListboxOptions
                            transition
                            className="absolute w-full mt-2 bg-[#1e1e2d] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <ListboxOption
                                key={role.value}
                                value={role.value}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${active ? "bg-white/10 text-white" : "text-gray-300"
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? "font-bold text-white" : "font-normal"}`}>
                                      {role.label}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                                        <Check className="w-4 h-4" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </div>
                      </Listbox>
                    </div>
                  </div>

                  <div className="p-6 pt-2 flex items-center justify-center pb-8">
                    <button
                      onClick={handleInvite}
                      disabled={isAddingCollab || !canSubmit}
                      className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[#a3a3a3] hover:bg-white text-black rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:hover:bg-[#a3a3a3]"
                    >
                      {isAddingCollab ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Invite
                    </button>
                  </div>
                </motion.div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </Fragment>
  );
}