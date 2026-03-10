import React, { useState } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import {
  Link as LinkIcon,
  Mail,
  X,
  UserPlus,
  CopyCheck,
  Copy,
  Send,
} from "lucide-react";
import clsx from "clsx";

interface InviteModalProps {
  scriptTitle: string;
}

const InviteModal = ({ scriptTitle }: InviteModalProps) => {
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
    alert(`Invite sent to ${email}`);
    setEmail("");
    setIsOpen(false);
  };

  const inputClass =
    "w-full p-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none placeholder:text-gray-500 text-sm";
  const labelClass =
    "flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest font-sans";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
        title="Invite Members"
      >
        <UserPlus size={20} />
      </button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-50 font-sans"
        onClose={() => setIsOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto scrollbar-none font-mono">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-3xl bg-[#0f0f15] text-left shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 sm:my-8 w-full max-w-md border border-white/10 p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                {/*<div>*/}
                <h3 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                  Invite Members
                </h3>

                {/*</div>*/}
                <button
                  onClick={() => setIsOpen(false)}
                  className=" text-gray-500 hover:text-white transition-colors outline-none shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <hr className="border-b-0.5 border-white/5 " />
              <div>
                <label className={labelClass}>
                  <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                  Share Link
                </label>
                <div className="flex items-center gap-2 p-1.5  bg-white/5 border border-white/10 rounded-xl focus-within:border-white/30 transition-all shadow-inner">
                  <div className="flex-1 overflow-hidden px-2">
                    <span className="text-sm font-mono text-gray-400 truncate block select-all">
                      {inviteLink}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={clsx(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all outline-none active:scale-95 shrink-0",
                      copied
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-white/5 hover:bg-white/10 text-white border border-transparent",
                    )}
                  >
                    {copied ? (
                      <>
                        <CopyCheck size={16} />
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="mx-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    Invite via Email
                  </label>
                  {/*<div className="relative">*/}
                  {/*<Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />*/}
                  <input
                    type="email"
                    required
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  {/*</div>*/}
                </div>
                <p className=" text-gray-500 mt-1.5 font-medium font-mono leading-relaxed">
                  Invite collaborators to{" "}
                  <span className="text-gray-300 font-bold">
                    "{scriptTitle}"
                  </span>
                  . They will be able to propose changes and view the timeline.
                </p>
                <button
                  type="submit"
                  className="group flex items-center justify-center w-full gap-3 py-3 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-bold font-mono transition-all tracking-wide active:scale-95"
                >
                  <Send className="w-4 h-4 transition-transform" />
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
