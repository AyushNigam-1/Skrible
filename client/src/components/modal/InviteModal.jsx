import { useState, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  Link as LinkIcon,
  Mail,
  X,
  Check,
  UserPlus,
  Globe,
} from "lucide-react";

const InviteModal = ({ isOpen, setIsOpen, scriptTitle }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const inviteLink = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    // Add your invitation logic here
    alert(`Invite sent to ${email}`);
    setEmail("");
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-sm"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 backdrop-blur-sm"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/60 transition-opacity" />
        </TransitionChild>

        {/* Modal Positioning */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
            >
              <DialogPanel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-[#130f1c]/95 backdrop-blur-2xl p-6 shadow-2xl border border-white/10 transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/10 rounded-lg text-white">
                      <UserPlus size={18} />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-white tracking-tight">
                      Invite Members
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                  Invite collaborators to{" "}
                  <span className="text-white font-semibold">
                    "{scriptTitle}"
                  </span>
                  . They will be able to propose changes and view the timeline.
                </p>

                {/* Section 1: Share Link */}
                <div className="space-y-2 mb-6">
                  <label className="text-[11px] font-semibold font-mono text-gray-400 uppercase tracking-wider">
                    Share Invite Link
                  </label>
                  <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg focus-within:border-white/30 transition-all">
                    <div className="flex items-center gap-2 pl-2 flex-1 overflow-hidden">
                      <LinkIcon size={14} className="text-gray-500 shrink-0" />
                      <span className="text-xs font-mono text-gray-400 truncate select-all">
                        {inviteLink}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all font-mono ${
                        copied
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-white hover:bg-gray-200 text-black shadow-lg shadow-white/10"
                      }`}
                    >
                      {copied && <Check size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative flex items-center mb-6">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                    OR
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Section 2: Email Invite */}
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold font-mono text-gray-400 uppercase tracking-wider">
                      Invite by Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        size={14}
                      />
                      <input
                        type="email"
                        required
                        placeholder="colleague@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:bg-white/10 focus:ring-1 focus:ring-white/30 focus:border-white/30 outline-none transition-all placeholder:text-gray-600 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm font-mono tracking-wide"
                  >
                    Send Invitation
                  </button>
                </form>

                {/* Footer Note */}
                <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium">
                  <Globe size={10} />
                  <span>Visible to anyone with the link</span>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InviteModal;
