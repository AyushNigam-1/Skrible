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

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-gray-200 focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all outline-none placeholder:text-gray-600 text-sm font-mono shadow-inner font-medium";

  const labelClass = "block font-semibold text-gray-300 mb-1 text-sm font-mono";

  const helperClass = "text-[10px] text-gray-500 mt-1.5 font-mono";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/10 border border-white/10 text-gray-800 rounded-lg transition-all duration-300 text-sm font-semibold shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4" />
        New Draft
      </button>

      <Dialog
        open={open}
        as="div"
        className="relative z-50"
        onClose={() => setOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Panel: Extremely dark blue/gray to match the UI screenshot */}
            <DialogPanel
              transition
              className="relative transform rounded-2xl bg-[#121216] text-left shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 sm:my-8 w-full max-w-2xl border border-white/10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Create Draft
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <hr className="border-b border-white/10" />
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                        <span className="truncate">
                          {selectedGenres.length
                            ? selectedGenres.map((g) => g.name).join(", ")
                            : "Select genres"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </ListboxButton>

                      <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto">
                        <div className="p-2">
                          <input
                            placeholder="Search..."
                            value={genreSearch}
                            onChange={(e) => setGenreSearch(e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        {filteredGenres.map((genre) => (
                          <ListboxOption
                            key={genre.id}
                            value={genre}
                            className="cursor-pointer px-4 py-3 hover:bg-white/10 flex justify-between"
                          >
                            {({ selected }) => (
                              <>
                                <span>{genre.name}</span>
                                {selected && <Check className="w-4 h-4" />}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>

                  {/*<p className={helperClass}>Multiple allowed</p>*/}
                </div>

                {/* Language (single select) */}
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
                        <span className="truncate">
                          {selectedLanguage?.name || "Select language"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </ListboxButton>

                      <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto">
                        <div className="p-2">
                          <input
                            placeholder="Search..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        {filteredLanguages.map((language) => (
                          <ListboxOption
                            key={language.id}
                            value={language}
                            className="cursor-pointer px-4 py-3 hover:bg-white/10 flex justify-between"
                          >
                            {({ selected }) => (
                              <>
                                <span>{language.name}</span>
                                {selected && <Check className="w-4 h-4" />}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
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
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </ListboxButton>

                      <ListboxOptions className="absolute z-20 mt-2 w-full bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl">
                        {visibilityOptions.map((v) => (
                          <ListboxOption
                            key={v.id}
                            value={v}
                            className="cursor-pointer px-4 py-3 hover:bg-white/10 flex justify-between"
                          >
                            {({ selected }) => (
                              <>
                                <span>{v.name}</span>
                                {selected && <Check className="w-4 h-4" />}
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
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Write a brief overview..."
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>
                <hr className="border-b border-white/10" />

                {/* Submit */}
                <div className="flex justify-center ">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-bold shadow-lg disabled:opacity-50"
                  >
                    {loading && (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    )}
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Add;
