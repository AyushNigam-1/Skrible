import React, { useState } from "react";
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
import { X, ChevronDown, Upload, Loader2 } from "lucide-react";

import { ADD_SCRIPT } from "../../graphql/mutation/scriptMutations";

const Add = ({ open, setOpen }) => {
    const navigate = useNavigate();

    const visibilityOptions = [
        { id: 1, name: "Public" },
        { id: 2, name: "Private" },
        { id: 3, name: "Unlisted" },
    ];

    const [selected, setSelected] = useState(visibilityOptions[0]);

    const [addScript, { loading }] = useMutation(ADD_SCRIPT);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const title = formData.get("title");
        const languages = formData
            .get("languages")
            .split(",")
            .map((l) => l.trim());

        const genres = formData
            .get("genres")
            .split(",")
            .map((g) => g.trim());

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

            navigate(`/paragraphs/${scriptId}`);

            e.target.reset();
            setOpen(false);
        } catch (err) {
            console.error("Failed to create script:", err);
            alert("Failed to create script");
        }
    };

    const inputClass =
        "w-full mt-1.5 p-3 rounded-lg outline-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500";

    const labelClass =
        "block text-sm font-semibold text-gray-700 dark:text-gray-300";

    return (
        <Transition show={open} appear as={React.Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setOpen(false)}
            >
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60" />
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
                            <DialogPanel className="w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6">

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Create Script
                                    </h3>

                                    <button onClick={() => setOpen(false)}>
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input name="title" required className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Languages</label>
                                        <input
                                            name="languages"
                                            required
                                            className={inputClass}
                                            placeholder="English, Hindi"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Visibility</label>
                                        <Listbox value={selected} onChange={setSelected}>
                                            <div className="relative mt-1.5">
                                                <ListboxButton
                                                    className={clsx(
                                                        inputClass,
                                                        "flex justify-between items-center"
                                                    )}
                                                >
                                                    {selected.name}
                                                    <ChevronDown className="w-5 h-5" />
                                                </ListboxButton>

                                                <ListboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded shadow">
                                                    {visibilityOptions.map((v) => (
                                                        <ListboxOption
                                                            key={v.id}
                                                            value={v}
                                                            className="cursor-pointer p-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                                                        >
                                                            {v.name}
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </div>
                                        </Listbox>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Genres</label>
                                        <input name="genres" required className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea
                                            name="description"
                                            rows={3}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">

                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="px-6 py-2 rounded"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Upload className="w-5 h-5" />
                                            )}
                                            {loading ? "Creating..." : "Create Script"}
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
