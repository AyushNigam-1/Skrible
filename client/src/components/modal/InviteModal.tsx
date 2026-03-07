import React, { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
  DialogTitle,
} from "@headlessui/react";
import {
  Link as LinkIcon,
  Mail,
  X,
  Check,
  UserPlus,
  Globe,
  CopyCheck,
  Copy,
  Send,
} from "lucide-react";
import clsx from "clsx";

interface InviteModalProps {
  scriptTitle: string;
}

const InviteModal = ({ scriptTitle }: InviteModalProps) => {
  // 1. Internal state management
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

  const inviteLink = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your actual invitation mutation/logic here
    alert(`Invite sent to ${email}`);
    setEmail("");
    setIsOpen(false); // Closes the modal after sending
  };

  // Sleek minimal styles matching your other components
  const inputClass =
    "w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-200 focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all outline-none placeholder:text-gray-600  font-sans shadow-inner";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-2 font-mono";

  return (
    <>
      {/* 2. Self-contained Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 text-sm font-semibold shadow-sm shrink-0 active:scale-95 font-mono"
      >
        <UserPlus size={20} />
        {/*Invite*/}
      </button>

      {/* 3. Modal Dialog */}
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-50 font-mono"
        onClose={() => setIsOpen(false)}
      >
        {/* Darker Backdrop for emphasis */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
        />

        {/* Modal Positioning */}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Panel: Extremely dark blue/gray to match the UI system */}
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-2xl bg-[#0A0A14] text-left shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 sm:my-8 w-full max-w-md border border-white/10 p-5 space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {/*<div className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-300">
                    <UserPlus size={18} strokeWidth={2} />
                  </div>*/}
                  <DialogTitle className="text-xl font-sans font-extrabold text-white ">
                    Invite Members
                  </DialogTitle>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className=" text-gray-500 hover:text-white transition-colors outline-none"
                >
                  <X size={18} />
                </button>
              </div>
              <hr className="border-b border-white/10" />

              <p className="text-gray-300 font-medium">
                Invite collaborators to{" "}
                <span className="text-white font-semibold">
                  "{scriptTitle}"
                </span>
                . They will be able to propose changes and view the timeline.
              </p>

              <div className="space-y-2">
                <label className={labelClass}>Share Invite Link</label>
                <div className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-white/30 transition-all">
                  <div className="flex items-center gap-2 pl-2 flex-1 overflow-hidden">
                    <LinkIcon size={14} className="text-gray-500 shrink-0" />
                    <span className="text-sm font-mono text-gray-400 truncate select-all">
                      {inviteLink}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={clsx(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all outline-none active:scale-95",
                      copied
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white hover:bg-gray-200 text-black shadow-sm",
                    )}
                  >
                    {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="mx-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Section 2: Email Invite */}
              <form onSubmit={handleSendInvite} className="space-y-6">
                <div>
                  <label className={labelClass}>Invite by Email</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="email"
                      required
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black hover:bg-gray-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm tracking-wide active:scale-95"
                >
                  <Send size={16} />
                  Send Invitation
                </button>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default InviteModal;
