import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  // 1. Fetch Profile Data using generated hook
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

  // 2. Fetch User's Scripts using generated hook
  const {
    data: scriptsData,
    loading: scriptsLoading,
    error: scriptsError,
  } = useGetUserScriptsQuery({
    variables: { userId: profileUserId || "" },
    skip: !profileUserId,
  });

  // Memoize the filtering logic
  const filteredScripts = useMemo(() => {
    return scriptsData?.getUserScripts?.filter((script) =>
      script?.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [scriptsData, search]);

  // Framer Motion container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  if (profileLoading) return <Loader />;

  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[70vh] gap-4 font-mono animate-in fade-in">
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-full text-red-500 shadow-lg backdrop-blur-md">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center font-mono text-lg">
          {profileError.message}
        </p>
      </div>
    );
  }

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
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto font-mono animate-in fade-in duration-500">
      {/* ========================================= */}
      {/* TOP SECTION: PROFILE INFO                 */}
      {/* ========================================= */}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* --- Left Sidebar (Avatar & Actions) --- */}
          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            {/* Identity Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg flex flex-col items-center text-center gap-4">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black shadow-inner border-4 border-white/10">
                {initial}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  {userProfile?.username}
                </h2>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  @{userProfile?.username?.toLowerCase()}
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2 w-full text-sm text-gray-400 font-medium">
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                  <MapPin className="w-4 h-4 text-blue-500" /> Earth
                </div>
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                  <CalendarDays className="w-4 h-4 text-purple-500" /> Joined
                  recently
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
                    <Heart className="w-5 h-5 text-pink-500" /> Like Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- Main Details Panel --- */}
          <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-lg ">
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
                      className={`text-xl font-medium font-mono leading-relaxed ${
                        detail.value === "Not provided"
                          ? "text-gray-500"
                          : "text-gray-200"
                      }`}
                    >
                      {detail.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-t border-t-gray-600" />

      {/* ========================================= */}
      {/* BOTTOM SECTION: DRAFTS/SCRIPTS            */}
      {/* ========================================= */}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">
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

        {/* Scripts Grid / States */}
        <div className="flex-1 mt-2">
          {scriptsError ? (
            <div className="flex items-start gap-4 p-5 bg-red-500/10 text-red-400 rounded-3xl border border-red-500/20 shadow-lg backdrop-blur-md">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Failed to load scripts
                </h3>
                <p className="text-sm opacity-90">{scriptsError.message}</p>
              </div>
            </div>
          ) : scriptsLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader />
            </div>
          ) : !filteredScripts || filteredScripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg">
              <div className="bg-white/5 p-5 rounded-full mb-5 border border-white/10">
                <SearchX className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                No scripts available
              </h3>
              <p className="text-gray-400 max-w-md mb-6 leading-relaxed">
                {search
                  ? "No drafts found matching your search."
                  : isOwnProfile
                    ? "You haven't created any stories or drafts yet. Click the button below to start your creative journey."
                    : "This user hasn't published any scripts yet."}
              </p>
              {isOwnProfile && !search && (
                <Link
                  to="/add"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Start Creating
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-sans"
            >
              <AnimatePresence mode="popLayout">
                {filteredScripts.map((script) => (
                  <DraftCard key={script!.id} script={script!} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
