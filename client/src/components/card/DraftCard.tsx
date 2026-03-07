import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ThumbsUp, ThumbsDown, Globe2 } from "lucide-react";

// The ultimate, flexible interface that won't crash regardless of which GraphQL query calls it
export interface DraftCardProps {
  script: {
    id: string;
    title: string;
    createdAt?: string | null;
    description?: string | null;
    // Using any[] stops TypeScript from crashing if one query returns ["user_1"]
    // and another query returns [{ id: "user_1" }]
    likes?: any[] | null;
    dislikes?: any[] | null;
    languages?: string[] | null;
    genres?: string[] | null;
    author?: {
      username: string;
    } | null;
  };
}

const DraftCard = ({ script }: DraftCardProps) => {
  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(Number(timestamp)));
  };

  const itemVariants: Variants = {
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

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
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
          {script.description || "No description provided for this manuscript."}
        </p>

        <div className="flex items-center justify-between">
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
            {script.languages && script.languages.length > 0 && (
              <span className="flex items-center gap-1.5 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                <Globe2 className="w-3 h-3" />
                {script.languages[0]}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DraftCard;
