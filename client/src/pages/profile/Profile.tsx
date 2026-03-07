import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  User,
  Languages,
  AlignLeft,
  Mail,
  Heart,
  Eye,
  Users,
  MapPin,
  CalendarDays,
  Plus,
  SearchX,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Import the generated hooks
import {
  useGetUserProfileQuery,
  useGetUserScriptsQuery,
} from "../../graphql/generated/graphql";

import Loader from "../../components/layout/Loader";
import Search from "../../components/layout/Search";
import DraftCard from "../../components/card/DraftCard";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [search, setSearch] = useState("");

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser).username : null;
  const isOwnProfile = currentUser === username;

  // 1. Fetch Profile Data
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useGetUserProfileQuery({
    variables: { username: username || "" },
    skip: !username,
  });

  const userProfile = profileData?.getUserProfile;
  const profileUserId = userProfile?.id;

  // 2. Fetch User's Scripts
  const {
    data: scriptsData,
    loading: scriptsLoading,
    error: scriptsError,
  } = useGetUserScriptsQuery({
    variables: { userId: profileUserId || "" },
    skip: !profileUserId,
    fetchPolicy: "cache-and-network",
  });

  // Memoize filtering
  const filteredScripts = useMemo(() => {
    return scriptsData?.getUserScripts?.filter((script) =>
      script?.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [scriptsData, search]);

  // --- Unique Variants to prevent Layout Collisions ---
  const pageVariants: Variants = {
    fadeInit: { opacity: 0, y: 15 },
    fadeShow: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
    fadeExit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const itemVariants: Variants = {
    fadeInit: { opacity: 0, y: 15 },
    fadeShow: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const userDetails = [
    {
      title: "Full Name",
      value: userProfile?.username || "Not provided",
      icon: User,
    },
    { title: "Email", value: userProfile?.email || "Not provided", icon: Mail },
    {
      title: "Languages",
      value: userProfile?.languages?.join(", ") || "Not provided",
      icon: Languages,
    },
    {
      title: "Interests",
      value: userProfile?.interests?.join(", ") || "Not provided",
      icon: Heart,
    },
    {
      title: "Bio",
      value:
        userProfile?.bio ||
        "This user prefers to keep an air of mystery about them.",
      icon: AlignLeft,
    },
  ];

  const statsInfo = [
    {
      title: "Profile Views",
      value: userProfile?.views?.length || 0,
      icon: Eye,
    },
    {
      title: "Total Likes",
      value: userProfile?.likes?.length || 0,
      icon: Heart,
    },
    {
      title: "Followers",
      value: userProfile?.followers?.length || 0,
      icon: Users,
    },
  ];

  const initial = userProfile?.username?.charAt(0).toUpperCase() || "?";

  return (
    <div className="w-full max-w-7xl mx-auto font-mono pb-12">
      <AnimatePresence mode="wait">
        {profileLoading ? (
          <motion.div
            key="profile-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[90vh] gap-4"
          >
            <Loader />
          </motion.div>
        ) : profileError ? (
          <motion.div
            key="profile-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-[70vh] gap-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-full text-red-500 shadow-lg backdrop-blur-md">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Profile not found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center text-sm">
              {profileError.message}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="profile-content"
            variants={pageVariants}
            initial="fadeInit"
            animate="fadeShow"
            exit="fadeExit"
            className="flex flex-col gap-10 w-full"
          >
            {/* ========================================= */}
            {/* TOP SECTION: PROFILE INFO                 */}
            {/* ========================================= */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* --- Left Sidebar (Avatar & Actions) --- */}
                <motion.div
                  variants={itemVariants}
                  className="w-full lg:w-80 flex flex-col gap-6 shrink-0"
                >
                  {/* Identity Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg flex flex-col items-center text-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />

                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black shadow-inner border-4 border-white/10 relative z-10">
                      {initial}
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-white tracking-wide">
                        {userProfile?.username}
                      </h2>
                      <p className="text-sm text-gray-400 font-medium mt-1">
                        @{userProfile?.username?.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 mt-2 w-full text-sm text-gray-400 font-medium relative z-10">
                      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                        <MapPin className="w-4 h-4 text-blue-500" /> Earth
                      </div>
                      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                        <CalendarDays className="w-4 h-4 text-purple-500" />{" "}
                        Joined recently
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-lg flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      {statsInfo.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl"
                          >
                            <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                              <Icon className="w-5 h-5 text-blue-400" />
                              {stat.title}
                            </div>
                            <span className="text-lg font-bold text-white">
                              {stat.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {!isOwnProfile && (
                      <div className="flex flex-col gap-3 mt-2">
                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                          <User className="w-5 h-5" /> Follow
                        </button>
                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold rounded-2xl transition-all active:scale-95">
                          <Heart className="w-5 h-5 text-pink-500" /> Like
                          Profile
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* --- Main Details Panel --- */}
                <motion.div
                  variants={itemVariants}
                  className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 tracking-tight">
                    About
                  </h3>
                  <div className="flex flex-col gap-8">
                    {userDetails.map((detail, idx) => {
                      const Icon = detail.icon;
                      return (
                        <div key={idx} className="flex flex-col gap-2">
                          <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <Icon className="w-4 h-4 text-blue-500" />
                            {detail.title}
                          </h4>
                          <p
                            className={`text-xl font-medium font-mono leading-relaxed ${detail.value === "Not provided" ? "text-gray-500" : "text-gray-200"}`}
                          >
                            {detail.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.hr
              variants={itemVariants}
              className="border-t border-white/10"
            />
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              {/* Drafts Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="text-3xl font-sans font-bold text-white tracking-tight">
                  {isOwnProfile ? "Drafts" : "Published Drafts"}
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-72">
                    <Search
                      setSearch={setSearch}
                      placeholder={`Search ${isOwnProfile ? "my" : "their"} scripts...`}
                    />
                  </div>
                  {isOwnProfile && (
                    <Link
                      to="/add"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-xl font-semibold shadow-lg shadow-blue-900/20 active:scale-95 transition-all duration-200 shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Scripts Content Area (with AnimatePresence for smooth state switching) */}
              <div className="flex-1 mt-2">
                <AnimatePresence mode="wait">
                  {scriptsLoading ? (
                    <motion.div
                      key="scripts-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center min-h-[300px] flex-col gap-4"
                    >
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                      <p className="text-gray-400 text-sm">
                        Loading scripts...
                      </p>
                    </motion.div>
                  ) : scriptsError ? (
                    <motion.div
                      key="scripts-error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-4 p-6 bg-red-500/10 text-red-400 rounded-3xl border border-red-500/20 shadow-lg backdrop-blur-md"
                    >
                      <AlertCircle className="w-8 h-8 shrink-0 text-red-500" />
                      <div>
                        <h3 className="font-bold text-xl mb-1 text-white">
                          Failed to load scripts
                        </h3>
                        <p className="text-sm text-red-300">
                          {scriptsError.message}
                        </p>
                      </div>
                    </motion.div>
                  ) : !filteredScripts || filteredScripts.length === 0 ? (
                    <motion.div
                      key="scripts-empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center text-center py-24 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
                      <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10 relative z-10">
                        <SearchX className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight relative z-10">
                        No scripts available
                      </h3>
                      <p className="text-gray-400 max-w-md mb-8 leading-relaxed relative z-10">
                        {search
                          ? "No drafts found matching your search."
                          : isOwnProfile
                            ? "You haven't created any stories or drafts yet. Click the button below to start your creative journey."
                            : "This user hasn't published any scripts yet."}
                      </p>
                      {isOwnProfile && !search && (
                        <Link
                          to="/add"
                          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-95 relative z-10"
                        >
                          <Plus className="w-5 h-5" />
                          Start Creating
                        </Link>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="scripts-grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredScripts.map((script) => (
                          <motion.div
                            layout
                            key={script!.id}
                            variants={itemVariants}
                            initial="fadeInit"
                            animate="fadeShow"
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full"
                          >
                            <DraftCard script={script!} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
