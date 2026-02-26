import React, { useState } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Link as LinkIcon, Mail, X, Check, UserPlus, Globe } from 'lucide-react';

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
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white/5 backdrop-blur-2xl p-8 shadow-2xl border border-white/10 transition-all font-['Inter']">

                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-400">
                                            <UserPlus size={24} />
                                        </div>
                                        <Dialog.Title className="text-2xl font-bold text-white tracking-tight">
                                            Invite Members
                                        </Dialog.Title>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                                    Invite collaborators to <span className="text-blue-400 font-semibold">"{scriptTitle}"</span>.
                                    They will be able to propose changes and view the timeline.
                                </p>

                                {/* Section 1: Share Link */}
                                <div className="space-y-3 mb-8">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Share Invite Link
                                    </label>
                                    <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl focus-within:border-blue-500/50 transition-all">
                                        <div className="flex items-center gap-2 pl-3 flex-1 overflow-hidden">
                                            <LinkIcon size={16} className="text-gray-500 shrink-0" />
                                            <span className="text-sm text-gray-400 truncate select-all">
                                                {inviteLink}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${copied
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                                                }`}
                                        >
                                            {copied ? <Check size={16} /> : null}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="relative flex items-center mb-8">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">OR</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                {/* Section 2: Email Invite */}
                                <form onSubmit={handleSendInvite} className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            Invite by Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="email"
                                                required
                                                placeholder="colleague@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        Send Invitation
                                    </button>
                                </form>

                                {/* Footer Note */}
                                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-medium">
                                    <Globe size={12} />
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