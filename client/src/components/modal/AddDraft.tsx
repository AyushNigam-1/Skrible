import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { X, ChevronDown, Check, Loader2, Plus } from "lucide-react";
import { ADD_SCRIPT } from "../../graphql/mutation/scriptMutations";
import { posthog } from "../providers/PostHogProvider";

interface VisibilityOption {
  id: number;
  name: string;
  description: string;
}

interface Option {
  id: number;
  name: string;
}

const visibilityOptions: VisibilityOption[] = [
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

const genreOptions: Option[] = [
  { id: 1, name: "Fantasy" },
  { id: 2, name: "Mystery" },
  { id: 3, name: "Sci-Fi" },
  { id: 4, name: "Horror" },
  { id: 5, name: "Thriller" },
  { id: 6, name: "Romance" },
  { id: 7, name: "Drama" },
  { id: 8, name: "Adventure" },
];

const languageOptions: Option[] = [
  { id: 1, name: "English" },
  { id: 2, name: "Spanish" },
  { id: 3, name: "French" },
  { id: 4, name: "German" },
  { id: 5, name: "Hindi" },
  { id: 6, name: "Japanese" },
  { id: 7, name: "Korean" },
];

const Add = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedVisibility, setSelectedVisibility] =
    useState<VisibilityOption>(visibilityOptions[0]);

  const [selectedGenres, setSelectedGenres] = useState<Option[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Option | null>(null);

  const [genreSearch, setGenreSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");

  const [addScript, { loading }] = useMutation(ADD_SCRIPT);

  const filteredGenres = genreOptions.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase()),
  );

  const filteredLanguages = languageOptions.filter((l) =>
    l.name.toLowerCase().includes(languageSearch.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const genres = selectedGenres.map((g) => g.name);
    const languages = selectedLanguage ? [selectedLanguage.name] : [];

    try {
      const res = await addScript({
        variables: {
          title,
          visibility: selectedVisibility.name,
          languages,
          genres,
          description,
        },
      });

      const scriptId = res.data.createScript.id;

      posthog.capture("draft_created", {
        script_id: scriptId,
        visibility: selectedVisibility.name,
        genre_count: genres.length,
        has_language: languages.length > 0,
      });

      e.currentTarget.reset();
      setSelectedGenres([]);
      setSelectedLanguage(null);

      setOpen(false);
      navigate(`/timeline/${scriptId}`);
    } catch (err) {
      console.error("Failed to create draft:", err);
      alert("Failed to create the manuscript. Please try again.");
    }
  };

  // --- Responsive Theme Classes ---
  const inputClass =
    "w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none placeholder:text-gray-500 text-sm font-mono shadow-inner font-medium";

  const labelClass =
    "block font-semibold text-gray-400 mb-1 md:mb-1.5 text-[11px] md:text-xs font-mono uppercase tracking-widest";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 md:px-5  bg-gray-100 hover:bg-gray-200 border border-white/10 rounded-xl text-gray-800 text-sm md:text-base font-bold transition-all duration-300 shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4 md:w-5 md:h-5" />
        Create
      </button>

      <Dialog
        open={open}
        as="div"
        className="relative z-50"
        onClose={() => setOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto scrollbar-none">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            {/* Panel: Responsive padding and border radius */}
            <DialogPanel
              transition
              className="relative transform rounded-2xl md:rounded-3xl bg-[#0f0f15] text-left shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 w-full max-w-2xl border border-white/10 p-5 md:p-6 space-y-4 md:space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight font-sans">
                  New Draft
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 md:p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-white/20"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <hr className="border-b border-white/5" />

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 md:gap-6"
              >
                {/* Title */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  {/* Genres */}
                  <div>
                    <label className={labelClass}>Genres</label>
                    <Listbox
                      value={selectedGenres}
                      onChange={setSelectedGenres}
                      multiple
                    >
                      <div className="relative">
                        <ListboxButton
                          className={clsx(
                            inputClass,
                            "flex justify-between items-center text-left",
                          )}
                        >
                          <span className="truncate pr-2">
                            {selectedGenres.length
                              ? selectedGenres.map((g) => g.name).join(", ")
                              : "Select genres"}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                        </ListboxButton>

                        <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#13131a] border border-white/10 rounded-xl shadow-2xl max-h-48 md:max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          <div className="p-2 sticky top-0 bg-[#13131a] z-10 border-b border-white/5">
                            <input
                              placeholder="Search..."
                              value={genreSearch}
                              onChange={(e) => setGenreSearch(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white text-xs md:text-sm outline-none border border-transparent focus:border-white/20"
                            />
                          </div>

                          {filteredGenres.map((genre) => (
                            <ListboxOption
                              key={genre.id}
                              value={genre}
                              className="cursor-pointer px-4 py-2.5 md:py-3 hover:bg-white/5 flex justify-between text-gray-300 font-mono text-xs md:text-sm transition-colors"
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={
                                      selected ? "text-white font-bold" : ""
                                    }
                                  >
                                    {genre.name}
                                  </span>
                                  {selected && (
                                    <Check className="w-4 h-4 text-white shrink-0" />
                                  )}
                                </>
                              )}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>

                  {/* Language */}
                  <div>
                    <label className={labelClass}>Language</label>
                    <Listbox
                      value={selectedLanguage}
                      onChange={setSelectedLanguage}
                    >
                      <div className="relative">
                        <ListboxButton
                          className={clsx(
                            inputClass,
                            "flex justify-between items-center text-left",
                          )}
                        >
                          <span className="truncate pr-2">
                            {selectedLanguage?.name || "Select language"}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                        </ListboxButton>

                        <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#13131a] border border-white/10 rounded-xl shadow-2xl max-h-48 md:max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          <div className="p-2 sticky top-0 bg-[#13131a] z-10 border-b border-white/5">
                            <input
                              placeholder="Search..."
                              value={languageSearch}
                              onChange={(e) =>
                                setLanguageSearch(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white text-xs md:text-sm outline-none border border-transparent focus:border-white/20"
                            />
                          </div>

                          {filteredLanguages.map((language) => (
                            <ListboxOption
                              key={language.id}
                              value={language}
                              className="cursor-pointer px-4 py-2.5 md:py-3 hover:bg-white/5 flex justify-between text-gray-300 font-mono text-xs md:text-sm transition-colors"
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={
                                      selected ? "text-white font-bold" : ""
                                    }
                                  >
                                    {language.name}
                                  </span>
                                  {selected && (
                                    <Check className="w-4 h-4 text-white shrink-0" />
                                  )}
                                </>
                              )}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className={labelClass}>Visibility</label>
                  <Listbox
                    value={selectedVisibility}
                    onChange={setSelectedVisibility}
                  >
                    <div className="relative">
                      <ListboxButton
                        className={clsx(
                          inputClass,
                          "flex justify-between items-center",
                        )}
                      >
                        {selectedVisibility.name}
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      </ListboxButton>

                      <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-y-auto max-h-60 py-1">
                        {visibilityOptions.map((v) => (
                          <ListboxOption
                            key={v.id}
                            value={v}
                            className="cursor-pointer px-4 py-2.5 md:py-3 hover:bg-white/5 flex flex-col transition-colors"
                          >
                            {({ selected }) => (
                              <div className="flex justify-between items-center w-full">
                                <div className="flex flex-col pr-4">
                                  <span
                                    className={`font-mono text-xs md:text-sm ${selected ? "text-white font-bold" : "text-gray-300"}`}
                                  >
                                    {v.name}
                                  </span>
                                  <span className="text-[11px] md:text-xs text-gray-500 mt-0.5 font-sans leading-tight">
                                    {v.description}
                                  </span>
                                </div>
                                {selected && (
                                  <Check className="w-4 h-4 text-white shrink-0" />
                                )}
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Write a brief overview..."
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>

                <hr className="border-b border-white/5 hidden md:block" />

                {/* Submit - Full width on mobile, auto width centered on desktop */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center mx-0 sm:mx-auto font-mono justify-center w-full sm:w-[160px] gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <Plus size={18} className="md:w-5 md:h-5" />
                      Create
                    </>
                  )}
                </button>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Add;
