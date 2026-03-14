import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  User,
  Languages,
  AlignLeft,
  Mail,
  Heart,
  Eye,
  MapPin,
  CalendarDays,
  SearchX,
  AlertCircle,
  Loader2,
  Edit2,
  Check,
  FileText,
} from "lucide-react";

import {
  useGetUserProfileQuery,
  useGetUserScriptsQuery,
  useUpdateUserProfileFieldMutation,
  useLikeProfileMutation,
  useViewProfileMutation,
} from "../../graphql/generated/graphql";

import Loader from "../../components/layout/Loader";
import Search from "../../components/layout/Search";
import { useUserStore } from "../../store/useAuthStore";
import Add from "../../components/modal/AddDraft";
import DraftCard from "../../components/card/DraftCard";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");

  const { user: currentUser } = useUserStore();
  const isOwnProfile = currentUser?.id === id;
  const [updateProfileField] = useUpdateUserProfileFieldMutation();

  // --- Edit State ---
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Like & View State (Optimistic UI) ---
  const [localProfileLikes, setLocalProfileLikes] = useState<string[]>([]);
  const [localProfileViews, setLocalProfileViews] = useState<string[]>([]);

  // 1. Fetch Profile Data
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useGetUserProfileQuery({
    variables: { id: id || "" },
    skip: !id,
  });

  const userProfile = profileData?.getUserProfile;
  const profileid = userProfile?.id;

  // Sync Fetched Profile Data with Local State
  useEffect(() => {
    if (userProfile) {
      setLocalProfileLikes((userProfile.likes as string[]) || []);
      setLocalProfileViews((userProfile.views as string[]) || []);
    }
  }, [userProfile]);

  // Mutation Hooks for Likes & Views
  const [likeProfile, { loading: isLikingProfile }] = useLikeProfileMutation();
  const [viewProfile] = useViewProfileMutation();

  // Automatic Unique View Trigger
  useEffect(() => {
    if (id && currentUser?.id && !isOwnProfile) {
      viewProfile({ variables: { profileId: id } }).catch((err) =>
        console.error("View profile error ignored:", err),
      );
    }
  }, [id, currentUser?.id, isOwnProfile, viewProfile]);

  // Handle Profile Like
  const handleLikeProfile = async () => {
    if (!currentUser?.id) return alert("Please log in to like profiles.");
    if (isOwnProfile) return;

    const prevLikes = [...localProfileLikes];
    const isLiked = localProfileLikes.includes(currentUser.id);

    if (isLiked) {
      setLocalProfileLikes(prevLikes.filter((uid) => uid !== currentUser.id));
    } else {
      setLocalProfileLikes([...prevLikes, currentUser.id]);
    }

    try {
      await likeProfile({ variables: { profileId: id || "" } });
    } catch (err) {
      setLocalProfileLikes(prevLikes);
      console.error("Failed to like profile:", err);
    }
  };

  // 2. Fetch User's Scripts
  const {
    data: scriptsData,
    loading: scriptsLoading,
    error: scriptsError,
  } = useGetUserScriptsQuery({
    variables: { userId: profileid || "" },
    skip: !profileid,
    fetchPolicy: "cache-and-network",
  });

  const filteredScripts = useMemo(() => {
    return scriptsData?.getUserScripts?.filter((script) =>
      script?.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [scriptsData, search]);

  // Boolean to cleanly hide the header when no scripts exist
  const hasScripts =
    scriptsData?.getUserScripts && scriptsData.getUserScripts.length > 0;

  // Auto-resize effect AND Cursor Placement for zero-shift editing
  useEffect(() => {
    if (editingField && textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [editValue, editingField]);

  const handleEditStart = (fieldId: string, currentValue: string) => {
    setEditingField(fieldId);
    setEditValue(currentValue);
  };

  const handleSave = async (fieldId: string) => {
    setIsUpdating(true);
    try {
      await updateProfileField({
        variables: {
          key: fieldId,
          value: editValue,
        },
      });
      setEditingField(null);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to save changes.");
    } finally {
      setIsUpdating(false);
    }
  };

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
      id: "username",
      title: "Full Name",
      value: userProfile?.username || "",
      icon: User,
      editable: true,
    },
    {
      id: "email",
      title: "Email",
      value: userProfile?.email || "",
      icon: Mail,
      editable: false,
    },
    {
      id: "languages",
      title: "Languages",
      value: userProfile?.languages?.join(", ") || "",
      icon: Languages,
      editable: true,
    },
    {
      id: "bio",
      title: "Bio",
      value: userProfile?.bio || "",
      icon: AlignLeft,
      editable: true,
    },
  ];

  const statsInfo = [
    {
      title: "Profile Views",
      value: localProfileViews.length,
      icon: Eye,
    },
    {
      title: "Total Likes",
      value: localProfileLikes.length,
      icon: Heart,
    },
  ];

  const initial = userProfile?.username?.charAt(0).toUpperCase() || "?";
  const EmptyIcon = search ? SearchX : FileText;

  return (
    <div className="w-full max-w-7xl mx-auto font-mono ">
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
            className="flex flex-col gap-6 w-full"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <motion.div
                  variants={itemVariants}
                  className="w-full lg:w-80 flex flex-col gap-4 shrink-0"
                >
                  {/* Identity Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg flex flex-col items-center text-center gap-4 relative overflow-hidden">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black shadow-inner border-4 border-white/10 relative z-10 ">
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
                    <div className="flex flex-col gap-2  w-full text-sm text-gray-400 font-medium relative z-10">
                      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                        <MapPin className="w-4 h-4 text-gray-500" /> Earth
                      </div>
                      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                        <CalendarDays className="w-4 h-4 text-gray-500" />{" "}
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
                              <Icon className="w-5 h-5 text-gray-400" />
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
                      <div className="flex flex-col gap-3 ">
                        <button
                          onClick={handleLikeProfile}
                          disabled={isLikingProfile}
                          className={`flex items-center justify-center gap-2 w-full py-3 border font-bold rounded-2xl transition-all active:scale-95 ${localProfileLikes.includes(currentUser?.id || "")
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200"
                            }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${localProfileLikes.includes(
                              currentUser?.id || "",
                            )
                              ? "fill-pink-500 text-pink-500"
                              : "text-pink-500"
                              }`}
                          />
                          {localProfileLikes.includes(currentUser?.id || "")
                            ? "Liked"
                            : "Like Profile"}
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
                    {userDetails.map((detail) => {
                      const Icon = detail.icon;
                      const isEditingThis = editingField === detail.id;

                      return (
                        <div
                          key={detail.id}
                          className="flex flex-col gap-2 group"
                        >
                          {/* Title & Edit Button */}
                          <div className="flex items-center justify-between">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                              <Icon className="w-4 h-4 text-gray-500" />
                              {detail.title}
                            </h4>
                            {isOwnProfile &&
                              detail.editable &&
                              !isEditingThis && (
                                <button
                                  onClick={() =>
                                    handleEditStart(detail.id, detail.value)
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                  title={`Edit ${detail.title}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                          </div>

                          {/* Zero-Shift Layout Grid */}
                          <div className="grid w-full relative items-start">
                            <AnimatePresence>
                              {!isEditingThis && (
                                <motion.div
                                  key="view"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0, pointerEvents: "none" }}
                                  transition={{ duration: 0.15 }}
                                  className="col-start-1 row-start-1"
                                >
                                  <p
                                    className={`text-xl font-medium font-mono leading-relaxed whitespace-pre-wrap ${!detail.value ? "text-gray-500 italic" : "text-gray-200"}`}
                                  >
                                    {detail.value ||
                                      (isOwnProfile
                                        ? `Click edit to add your ${detail.title.toLowerCase()}`
                                        : "Not provided")}
                                  </p>
                                </motion.div>
                              )}

                              {isEditingThis && (
                                <motion.div
                                  key="edit"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0, pointerEvents: "none" }}
                                  transition={{ duration: 0.15 }}
                                  className="col-start-1 row-start-1 w-full z-10"
                                >
                                  <textarea
                                    ref={textareaRef}
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    className="w-full bg-transparent text-white border-none p-0 m-0 focus:outline-none focus:ring-0 resize-none overflow-hidden text-xl font-medium font-mono leading-relaxed placeholder-gray-600 block caret-blue-500"
                                    placeholder={`Enter your ${detail.title.toLowerCase()}...`}
                                  />

                                  <div className="flex items-center gap-3 mt-4">
                                    <button
                                      onClick={() => setEditingField(null)}
                                      disabled={isUpdating}
                                      className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSave(detail.id)}
                                      disabled={isUpdating}
                                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Check className="w-4 h-4" />
                                      )}
                                      Save
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
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
              {/* --- ONLY SHOW HEADER IF THERE ARE SCRIPTS --- */}
              {hasScripts && (
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <h2 className="text-3xl font-sans font-extrabold text-white tracking-tight">
                    {isOwnProfile ? "Drafts" : "Published Drafts"}
                  </h2>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="w-full sm:w-64">
                      <Search
                        setSearch={setSearch}
                        placeholder={`Search ${isOwnProfile ? "my" : "their"} scripts...`}
                      />
                    </div>
                    {isOwnProfile && <Add />}
                  </div>
                </div>
              )}

              {/* Scripts Content Area */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {scriptsLoading ? (
                    <motion.div
                      key="scripts-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center min-h-[300px] flex-col gap-4"
                    >
                      <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
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
                      className="flex flex-col items-center justify-center text-center py-20 px-4 relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg space-y-4"
                    >
                      <div className="bg-white/10 p-5 rounded-full border border-white/20 relative z-10 shadow-sm">
                        <EmptyIcon className="w-8 h-8 text-gray-300" />
                      </div>

                      <h3 className="text-xl font-bold text-white relative z-10">
                        {search ? "No results found" : "No drafts available"}
                      </h3>

                      <p className="text-gray-400 max-w-md text-sm relative z-10">
                        {search
                          ? `We couldn't find any drafts matching "${search}".`
                          : isOwnProfile
                            ? "You haven't created any drafts yet. Click the button below to start your creative journey."
                            : "This user hasn't published any drafts yet."}
                      </p>

                      {isOwnProfile && !search && (
                        <div className="relative z-10">
                          <Add />
                        </div>
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
                          < DraftCard key={script!.id} script={script! as any} />
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