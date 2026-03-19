import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Search as SearchIcon,
    XCircle,
    FileText,
    Clock,
    CheckCircle,
    SearchX,
    ListFilter
} from "lucide-react";
import { GET_USER_CONTRIBUTIONS_BY_SCRIPT } from "../graphql/query/scriptQueries";
import Loader from "../components/layout/Loader";
import Search from "../components/layout/Search";
import Dropdown, { DropdownOption } from "../components/layout/Dropdown";

// Filter Options for the Dropdown
const FILTER_OPTIONS = [
    { id: "all", name: "All Requests" },
    { id: "approved", name: "Approved" },
    { id: "pending", name: "Pending" },
    { id: "rejected", name: "Rejected" },
];

const UserContributions = () => {
    const { draftId, userId } = useParams<{ draftId: string; userId: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(FILTER_OPTIONS[0]);

    const { data, loading, error } = useQuery(GET_USER_CONTRIBUTIONS_BY_SCRIPT, {
        variables: { scriptId: draftId || "", userId: userId || "" },
        skip: !draftId || !userId,
        fetchPolicy: "cache-and-network",
    });

    const contributions = data?.getUserContributionsByScript || [];

    const filteredContributions = useMemo(() => {
        let result = contributions;

        // 1. Apply Search Query
        if (searchQuery) {
            result = result.filter((c: any) =>
                c.text.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Apply Dropdown Filter
        if (selectedFilter.id !== "all") {
            result = result.filter((c: any) =>
                (c.status?.toLowerCase() || "pending") === selectedFilter.id
            );
        }

        return result;
    }, [contributions, searchQuery, selectedFilter]);

    const formatDate = (timestamp?: string | number) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(Number(timestamp)));
    };

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return {
                    color: "text-green-400 bg-green-500/10 border-green-500/20",
                    icon: CheckCircle,
                    label: "Approved",
                };
            case "rejected":
                return {
                    color: "text-red-400 bg-red-500/10 border-red-500/20",
                    icon: XCircle,
                    label: "Rejected",
                };
            default:
                return {
                    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    icon: Clock,
                    label: "Pending",
                };
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const scriptTitle = contributions[0]?.script?.title || "Manuscript";

    // Determine if we are actively searching/filtering vs just having an empty view
    const isFiltering = searchQuery !== "" || selectedFilter.id !== "all";

    return (
        <div className="w-full max-w-7xl mx-auto font-mono pb-12">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center w-full min-h-[80vh]"
                    >
                        <Loader />
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
                    >
                        <XCircle className="w-8 h-8 text-red-500 mb-3" />
                        <h2 className="text-base font-bold text-white mb-1">
                            Failed to load contributions
                        </h2>
                        <p className="text-gray-400 text-sm font-mono max-w-sm">{error.message}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col gap-6 w-full"
                    >
                        {/* --- HEADER --- */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 hover:text-white transition-all active:scale-95 shrink-0"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-white tracking-tight antialiased line-clamp-1">
                                    {scriptTitle}
                                </h1>
                            </div>

                            {/* Search & Filter Controls */}
                            {/* <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                        <div className="w-full sm:w-64">
                                            <Search setSearch={setSearchQuery} placeholder="Search your library..." />
                                        </div>
                                        <Dropdown
                                            options={FILTER_OPTIONS}
                                            value={selectedFilter}
                                            onChange={setSelectedFilter}
                                            icon={ListFilter}
                                            collapseOnMobile={true}
                                            className="w-full sm:w-auto shrink-0"
                                        />
                                    </div> */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                <div className="w-full sm:w-64">
                                    <Search value={searchQuery} setSearch={setSearchQuery} placeholder="Search requests..." />
                                </div>
                                <Dropdown
                                    options={FILTER_OPTIONS}
                                    value={selectedFilter}
                                    onChange={setSelectedFilter}
                                    icon={ListFilter}
                                    collapseOnMobile={true}
                                    className="w-full sm:w-auto shrink-0"
                                />
                            </div>
                        </div>

                        <hr className="border border-white/5" />

                        {/* --- GRID OR EMPTY STATE --- */}
                        {filteredContributions.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                            >
                                {filteredContributions.map((contribution: any) => {
                                    const statusInfo = getStatusConfig(contribution.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <motion.div key={contribution.id} variants={itemVariants} layout>
                                            <Link
                                                to={`/preview/${draftId}/${contribution.id}`}
                                                className="group flex flex-col h-full bg-white/5 hover:bg-white/5 border border-white/10 rounded-2xl p-5 md:p-5 transition-all duration-300 overflow-hidden relative"
                                            >
                                                <div className="flex items-start justify-between mb-4 gap-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-inner">
                                                            {contribution.author.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-bold font-sans text-base leading-tight">
                                                                {contribution.author.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500 font-mono mt-0.5">
                                                                {formatDate(contribution.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${statusInfo.color}`}
                                                    >
                                                        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="translate-y-[1px]">{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 mb-5">
                                                    <p className="text-gray-300 line-clamp-4 text-sm md:text-base leading-relaxed font-sans group-hover:text-gray-200 transition-colors">
                                                        {contribution.text.replace(/^#+\s/gm, "")}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between text-gray-400 text-xs font-bold pt-1">
                                                    <div className="flex items-center gap-5">
                                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                            <ThumbsUp size={16} />
                                                            {contribution.likes?.length || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                            <ThumbsDown size={16} />
                                                            {contribution.dislikes?.length || 0}
                                                        </span>
                                                    </div>
                                                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                        <MessageSquare size={16} />
                                                        {contribution.comments?.length || 0}
                                                    </span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            /* --- EMPTY STATE (Animated & Matches Theme) --- */
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex flex-col items-center justify-center py-24 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                                    {isFiltering ? (
                                        <SearchX className="w-10 h-10 text-gray-400" />
                                    ) : (
                                        <FileText className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>

                                <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight font-sans">
                                    {isFiltering ? "No Requests Found" : "No Contributions Yet"}
                                </h3>

                                <p className="text-gray-400 text-sm font-mono max-w-lg mb-8 leading-relaxed px-4">
                                    {isFiltering
                                        ? "We couldn't find any requests matching your current search or status filters."
                                        : "This user hasn't submitted any contributions to this manuscript yet."}
                                </p>

                                {!isFiltering && (
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-bold font-sans active:scale-95"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Go Back
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserContributions;