import { useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Globe2,
  MoreVertical,
  SearchX,
  User,
} from "lucide-react";

import Dropdown from "../Dropdown";
import useElementHeight from "../../hooks/useElementOffset";
import { DELETE_SCRIPT } from "../../graphql/mutation/scriptMutations";

const Scripts = ({ data, search }) => {
  const height = useElementHeight("not_found");
  const user = Cookies.get("jwt");

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

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(Number(timestamp)));
  };

  // --- Sleek Slide-Up Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "tween", ease: "easeOut", duration: 0.4 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  // --- EMPTY STATE ---
  if (!filtered || filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        id="not_found"
        style={{ minHeight: height || "50vh" }}
        className="flex flex-col items-center justify-center text-center p-8 bg-[#13151a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl font-['Inter'] relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="bg-white/5 border border-white/10 p-6 rounded-full mb-6 shadow-inner relative z-10">
          <SearchX className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display'] tracking-tight relative z-10">
          No Manuscripts Found
        </h3>
        <p className="text-gray-400 max-w-md text-base font-['Literata'] leading-relaxed relative z-10">
          We couldn't find any stories matching your current search or genre
          filters. Try adjusting them!
        </p>
      </motion.div>
    );
  }

  // --- GRID RENDER ---
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {filtered.map((script) => (
          <motion.div
            layout
            variants={itemVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            key={script.id}
            className="group relative bg-white/5 rounded-2xl p-4 border border-white/10 font-mono hover:border-white/20 hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden"
          >
            <Link
              to={`/timeline/${script.id}`}
              className="flex flex-col h-full cursor-pointer outline-none space-y-5 relative z-10"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-extrabold text-white font-sans line-clamp-1 transition-colors tracking-tight">
                  {script.title}
                </h2>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                  ~ {formatDate(script.createdAt)}
                </div>
              </div>

              <p className="text-gray-400 line-clamp-4 leading-relaxed flex-grow">
                {script.description ||
                  "No description provided for this manuscript."}
              </p>

              <div className="flex items-center justify-between ">
                <div className="flex items-center gap-4 text-gray-400 text-sm font-bold">
                  <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <ThumbsUp size={18} />
                    <span>{script.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-red-400 transition-colors">
                    <ThumbsDown size={18} />
                    <span>{script.dislikes?.length || 0}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {script.languages?.length > 0 && (
                    <span className="flex items-center gap-1.5 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                      <Globe2 className="w-3 h-3" />
                      {script.languages[0]}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Scripts;
