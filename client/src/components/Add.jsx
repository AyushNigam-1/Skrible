import React, { useState, Fragment } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogPanel,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { X, ChevronDown, Check, PenTool, Loader2 } from "lucide-react";

import { ADD_SCRIPT } from "../graphql/mutation/scriptMutations";

const Add = ({ open, setOpen }) => {
    const navigate = useNavigate();

    const visibilityOptions = [
        { id: 1, name: "Public", description: "Anyone can see and contribute" },
        { id: 2, name: "Private", description: "Only you can see this" },
        { id: 3, name: "Unlisted", description: "Anyone with the link can view" },
    ];

    const [selected, setSelected] = useState(visibilityOptions[0]);

    const [addScript, { loading }] = useMutation(ADD_SCRIPT);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const title = formData.get("title");
        const languages = formData.get("languages").split(",").map((l) => l.trim());
        const genres = formData.get("genres").split(",").map((g) => g.trim());
        const description = formData.get("description");

        try {
            const res = await addScript({
                variables: {
                    title,
                    visibility: selected.name,
                    languages,
                    genres,
                    description,
                },
            });

            const scriptId = res.data.createScript.id;

            e.target.reset();
            setOpen(false);
            navigate(`/paragraphs/${scriptId}`);

        } catch (err) {
            console.error("Failed to create draft:", err);
            alert("Failed to create draft. Please try again.");
        }
    };

    // Premium styling variables
    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm";
    const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide";
    const helperClass = "text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium";

    return (
        <Transition show={open} appear as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>

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
                    <div className="fixed inset-0 bg-gray-900/60 transition-opacity" />
                </TransitionChild>

                {/* Modal Positioning */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700">

                                {/* Header */}
                                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50">
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <PenTool className="w-5 h-5" />
                                        </div>
                                        Start a New Draft
                                    </h3>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form Body */}
                                <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-6">

                                    {/* Row 1: Title */}
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input
                                            name="title"
                                            required
                                            autoFocus
                                            placeholder="The epic tale of..."
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Row 2: Genres & Languages (Side by Side) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClass}>Genres</label>
                                            <input
                                                name="genres"
                                                required
                                                placeholder="Fantasy, Sci-Fi"
                                                className={inputClass}
                                            />
                                            <p className={helperClass}>Separate with commas</p>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Languages</label>
                                            <input
                                                name="languages"
                                                required
                                                placeholder="English, Spanish"
                                                className={inputClass}
                                            />
                                            <p className={helperClass}>Separate with commas</p>
                                        </div>
                                    </div>

                                    {/* Row 3: Visibility & Description */}
                                    <div className="flex flex-col gap-5">
                                        <div>
                                            <label className={labelClass}>Visibility</label>
                                            <Listbox value={selected} onChange={setSelected}>
                                                <div className="relative">
                                                    <ListboxButton className={clsx(inputClass, "flex justify-between items-center cursor-pointer text-left")}>
                                                        <span className="block truncate font-medium">{selected.name}</span>
                                                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                                    </ListboxButton>

                                                    <ListboxOptions className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl outline-none overflow-hidden origin-top-right">
                                                        {visibilityOptions.map((v) => (
                                                            <ListboxOption
                                                                key={v.id}
                                                                value={v}
                                                                className={({ active }) => clsx(
                                                                    "relative cursor-pointer select-none py-3 pl-4 pr-10",
                                                                    active ? "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-200"
                                                                )}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <div className="flex flex-col">
                                                                            <span className={clsx("block truncate", selected ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium")}>
                                                                                {v.name}
                                                                            </span>
                                                                            <span className={clsx("text-xs mt-0.5", active ? "text-blue-500 dark:text-blue-300" : "text-gray-500 dark:text-gray-400")}>
                                                                                {v.description}
                                                                            </span>
                                                                        </div>
                                                                        {selected && (
                                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                                                                                <Check className="w-5 h-5" />
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </ListboxOption>
                                                        ))}
                                                    </ListboxOptions>
                                                </div>
                                            </Listbox>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Synopsis / Description</label>
                                            <textarea
                                                name="description"
                                                rows={4}
                                                required
                                                placeholder="Write a brief overview of what this draft is about..."
                                                className={clsx(inputClass, "resize-none")}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700/80 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-all hover:-translate-y-0.5"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <PenTool className="w-4 h-4" />
                                            )}
                                            {loading ? "Creating..." : "Create Draft"}
                                        </button>
                                    </div>

                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default Add;