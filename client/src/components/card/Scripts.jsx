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

  // const [markAsInterested] = useMutation(MARK_AS_INTERESTED);
  // const [markAsNotInterested] = useMutation(MARK_AS_NOT_INTERESTED);
  // const [markAsFavourite] = useMutation(MARK_AS_FAVOURITE);
  const [deleteScript] = useMutation(DELETE_SCRIPT);

  const handleAction = async (actionFn, id, successMessage) => {
    try {
      if (!actionFn) return console.warn("Mutation function is not defined");
      await actionFn({ variables: { scriptId: id } });
      console.log(successMessage);
    } catch (error) {
      console.error(`Error ${successMessage.toLowerCase()}:`, error);
    }
  };

  const filtered = data?.getScriptsByGenres?.filter((e) =>
    e.title.toLowerCase().includes(search?.toLowerCase() || ""),
  );

  // --- EMPTY STATE ---
  if (!filtered || filtered.length === 0) {
    return (
      <div
        id="not_found"
        style={{ minHeight: height || "50vh" }}
        className="flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-3xl border border-white/10 shadow-2xl font-mono animate-in fade-in duration-500 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="bg-white/10 border border-white/20 p-5 rounded-full mb-5 shadow-sm relative z-10">
          <SearchX className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight relative z-10">
          No Scripts Found
        </h3>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed relative z-10">
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
          className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-white/5 hover:border-white/30 hover:-translate-y-1 hover:bg-white/5 transition-all duration-300 flex flex-col"
        >
          <Link
            to={`/timeline/${script.id}`}
            className="flex flex-col gap-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl"
          >
            {/* Header Area */}
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white line-clamp-1 transition-colors tracking-tight">
                {script.title}
              </h2>

              {/* Sleek Author Badge */}
              <span className="text-gray-400 text-sm font-semibold">
                @{script.author.username}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-400 line-clamp-4 leading-relaxed">
              {script.description || "No description provided."}
            </p>

            {/* Tags / Footer */}
            {/* <div className="flex flex-wrap gap-2 pt-2">*/}
            {/* {script.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="flex items-center gap-1.5 bg-black/40 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide group-hover:bg-white/10 transition-colors"
                >
                  <Tag className="w-3 h-3 text-white" />
                  {genre}
                </span>
              ))}*/}
            {/* {script.genres.length > 3 && (
                <span className="flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-black/40 border border-white/10">
                  +{script.genres.length - 3}
                </span>
              )}*/}
            {/* </div>*/}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Scripts;
