import React, { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Users, Trophy, Medal } from "lucide-react";

const Contributors = () => {
  const { data } = useOutletContext();
  const paragraphs = data?.getScriptById?.paragraphs || [];

  // useMemo efficiently groups, counts, and SORTS the contributors into a true leaderboard
  const contributorsLeaderboard = useMemo(() => {
    const grouped = {};

    paragraphs.forEach((item) => {
      const username = item.author?.username;
      if (!username) return;

      if (!grouped[username]) {
        grouped[username] = {
          username: username,
          count: 0,
        };
      }
      grouped[username].count += 1;
    });

    // Convert object to array and sort descending by contribution count
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [paragraphs]);

  // Helper to render special icons/colors for the Top 3 in a sleek monochrome theme
  const renderRankBadge = (index) => {
    if (index === 0)
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-white text-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]">
          <Trophy className="w-5 h-5" />
        </div>
      );
    if (index === 1)
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 text-white rounded-full shadow-sm border border-white/30">
          <Medal className="w-5 h-5" />
        </div>
      );
    if (index === 2)
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 text-gray-300 rounded-full shadow-sm border border-white/10">
          <Medal className="w-5 h-5" />
        </div>
      );

    return (
      <div className="flex items-center justify-center w-10 h-10 bg-transparent text-gray-500 font-bold font-mono rounded-full border border-white/10">
        #{index + 1}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto font-mono">
      {/* --- Content Area --- */}
      {contributorsLeaderboard.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500">
          {contributorsLeaderboard.map((contributor, index) => (
            <Link
              key={contributor.username}
              to={`/profile/${contributor.username}`}
              className="group flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-white/5 hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Dynamic Avatar */}
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg font-bold shadow-inner shrink-0 transition-transform group-hover:scale-105">
                  {contributor.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col overflow-hidden">
                  <h5 className="text-white font-bold text-lg truncate transition-colors">
                    @{contributor.username}
                  </h5>
                  <p className="text-xs font-medium text-gray-400 tracking-wide">
                    {contributor.count}{" "}
                    {contributor.count === 1 ? "CONTRIBUTION" : "CONTRIBUTIONS"}
                  </p>
                </div>
              </div>

              {/* Rank Badge */}
              <div className="shrink-0 ml-2">{renderRankBadge(index)}</div>
            </Link>
          ))}
        </div>
      ) : (
        /* --- Empty State --- */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-[#130f1c]/50 backdrop-blur-xl shadow-lg relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="bg-white/10 border border-white/20 p-4 rounded-full mb-5 shadow-sm relative z-10">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2  relative z-10">
            No contributors yet
          </h3>
          <p className="text-gray-400 max-w-md text-sm relative z-10">
            This draft doesn't have any approved contributions yet. Check back
            later or be the first to contribute!
          </p>
        </div>
      )}
    </div>
  );
};

export default Contributors;
