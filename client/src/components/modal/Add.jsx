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
import { X, ChevronDown, Check, Loader2 } from "lucide-react";

import { ADD_SCRIPT } from "../../graphql/mutation/scriptMutations";

const Add = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const visibilityOptions = [
    {
      id: 1,
      name: "Public",
      description: "Open to the world for reading and collaboration",
    },
    {
      id: 2,
      name: "Private",
      description: "A personal draft, visible only to you",
    },
    {
      id: 3,
      name: "Unlisted",
      description: "Accessible only via a direct, hidden link",
    },
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

      e.target.reset();
      setOpen(false);
      navigate(`/timeline/${scriptId}`); // Updated routing to match your layout
    } catch (err) {
      console.error("Failed to create draft:", err);
      alert("Failed to create the manuscript. Please try again.");
    }
  };

  // Minimal sleek styling variables
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all outline-none placeholder:text-gray-600 text-sm";
  const labelClass =
    "block text-xs font-semibold text-gray-400 mb-1.5 font-mono uppercase tracking-wider";
  const helperClass = "text-[11px] text-gray-500 mt-1";

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
          <div className="fixed inset-0 bg-black/60 transition-opacity" />
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
              <DialogPanel className="relative transform rounded-2xl bg-[#130f1c]/95 backdrop-blur-2xl text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl border border-white/10 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Create Manuscript
                  </h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Title */}
                  <div>
                    <label className={labelClass}>Working Title</label>
                    <input
                      name="title"
                      required
                      autoFocus
                      placeholder="The epic tale of..."
                      className={inputClass}
                    />
                  </div>

                  {/* Genres & Languages (Side by Side) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Genres</label>
                      <input
                        name="genres"
                        required
                        placeholder="Fantasy, Mystery..."
                        className={inputClass}
                      />
                      <p className={helperClass}>Comma separated</p>
                    </div>

                    <div>
                      <label className={labelClass}>Languages</label>
                      <input
                        name="languages"
                        required
                        placeholder="English, Spanish..."
                        className={inputClass}
                      />
                      <p className={helperClass}>Comma separated</p>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className={labelClass}>Visibility</label>
                    <Listbox value={selected} onChange={setSelected}>
                      <div className="relative">
                        <ListboxButton
                          className={clsx(
                            inputClass,
                            "flex justify-between items-center cursor-pointer text-left",
                          )}
                        >
                          <span className="block truncate text-white">
                            {selected.name}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                        </ListboxButton>

                        <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#1c1e24] border border-white/10 rounded-xl shadow-2xl outline-none overflow-hidden origin-top-right">
                          {visibilityOptions.map((v) => (
                            <ListboxOption
                              key={v.id}
                              value={v}
                              className={({ active }) =>
                                clsx(
                                  "relative cursor-pointer select-none py-3 pl-4 pr-10 transition-colors",
                                  active ? "bg-white/5" : "",
                                )
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <div className="flex flex-col">
                                    <span
                                      className={clsx(
                                        "block truncate text-sm",
                                        selected
                                          ? "font-bold text-white"
                                          : "font-medium text-gray-300",
                                      )}
                                    >
                                      {v.name}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                      {v.description}
                                    </span>
                                  </div>
                                  {selected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                                      <Check className="w-4 h-4" />
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

                  {/* Description */}
                  <div>
                    <label className={labelClass}>Synopsis</label>
                    <textarea
                      name="description"
                      rows={4}
                      required
                      placeholder="Write a brief overview..."
                      className={clsx(inputClass, "resize-none")}
                    />
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-3 pt-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-white text-black hover:bg-gray-200 text-sm font-bold shadow-lg disabled:opacity-50 transition-colors font-mono tracking-wide"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {loading ? "Creating..." : "Create"}
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
