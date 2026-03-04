import { useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import {
  ThumbsUp,
  ThumbsDown,
  Heart,
  Trash2,
  MoreVertical,
  Tag,
  SearchX,
} from "lucide-react";

import Dropdown from "../Dropdown";
import useElementHeight from "../../hooks/useElementOffset";
import {
  DELETE_SCRIPT,
  // MARK_AS_FAVOURITE,
  // MARK_AS_INTERESTED,
  // MARK_AS_NOT_INTERESTED
} from "../../graphql/mutation/scriptMutations";

const Scripts = ({ data, search }) => {
  const height = useElementHeight("not_found");
  const user = Cookies.get("jwt");

  // NOTE: Uncommented these hooks so your dropdownOptions don't throw an "undefined" crash
  // const [markAsInterested] = useMutation(MARK_AS_INTERESTED);
  // const [markAsNotInterested] = useMutation(MARK_AS_NOT_INTERESTED);
  // const [markAsFavourite] = useMutation(MARK_AS_FAVOURITE);
  const [deleteScript] = useMutation(DELETE_SCRIPT);

  const handleAction = async (actionFn, id, successMessage) => {
    try {
      if (!actionFn) return console.warn("Mutation function is not defined");
      await actionFn({ variables: { scriptId: id } });
      console.log(successMessage);
      // Optionally add a toast notification here
    } catch (error) {
      console.error(`Error ${successMessage.toLowerCase()}:`, error);
    }
  };

  // const dropdownOptions = [
  //   {
  //     name: "Interested",
  //     fnc: (id) => handleAction(markAsInterested, id, "Marked as Interested!"),
  //     icon: <ThumbsUp className="w-4 h-4" />,
  //   },
  //   {
  //     name: "Not Interested",
  //     fnc: (id) =>
  //       handleAction(markAsNotInterested, id, "Marked as Not Interested!"),
  //     icon: <ThumbsDown className="w-4 h-4" />,
  //   },
  //   {
  //     name: "Favourite",
  //     fnc: (id) => handleAction(markAsFavourite, id, "Marked as Favourite!"),
  //     icon: <Heart className="w-4 h-4 text-pink-500" />,
  //   },
  //   {
  //     name: "Delete",
  //     fnc: (id) => handleAction(deleteScript, id, "Script Deleted!"),
  //     icon: <Trash2 className="w-4 h-4" />,
  //     isDanger: true,
  //   },
  // ];

  const filtered = data?.getScriptsByGenres?.filter((e) =>
    e.title.toLowerCase().includes(search?.toLowerCase() || ""),
  );

  // --- EMPTY STATE ---
  if (!filtered || filtered.length === 0) {
    return (
      <div
        id="not_found"
        style={{ minHeight: height || "50vh" }}
        className="flex flex-col items-center justify-center text-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl font-['Inter'] animate-in fade-in duration-500"
      >
        <div className="bg-white/5 border border-white/10 p-5 rounded-full mb-5 shadow-inner">
          <SearchX className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          No Scripts Found
        </h3>
        <p className="text-gray-400 max-w-md text-[15px] leading-relaxed">
          We couldn't find any scripts matching your current search or genre
          filters. Try adjusting them!
        </p>
      </div>
    );
  }

  // --- GRID RENDER ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-mono animate-in fade-in duration-500">
      {filtered.map((script) => (
        <div
          key={script.id}
          className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-blue-900/20 hover:border-white/20 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 flex flex-col"
        >
          <Link
            to={`/timeline/${script.id}`}
            className="flex flex-col gap-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          >
            {/* Header Area */}
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors tracking-tight">
                {script.title}
              </h2>

              {/* Sleek Author Badge */}
              <span className="text-gray-400">@{script.author.username}</span>
            </div>

            {/* Description - Uses Literata for maximum readability */}
            <p className="text-lg text-gray-300 line-clamp-4">
              {script.description || "No description provided."}
            </p>

            {/* Tags / Footer */}
            <div className="flex flex-wrap gap-2 border-white/10">
              {script.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="flex items-center gap-1.5 bg-black/20 border border-white/5 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide group-hover:bg-white/5 transition-colors"
                >
                  <Tag className="w-3 h-3 text-blue-400" />
                  {genre}
                </span>
              ))}
              {script.genres.length > 3 && (
                <span className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-black/20 border border-white/5">
                  +{script.genres.length - 3}
                </span>
              )}
            </div>
          </Link>

          {/* Dropdown Options */}
          {/* {user && (
            <div
              className="absolute top-5 right-5 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown
                icon={
                  <button className="p-2 rounded-xl bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10 text-gray-400 hover:text-white transition-all backdrop-blur-md">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                }
                options={dropdownOptions}
                scriptId={script.id}
              />
            </div>
          )}*/}
        </div>
      ))}
    </div>
  );
};

export default Scripts;
