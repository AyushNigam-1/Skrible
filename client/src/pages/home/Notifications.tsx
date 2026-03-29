import { useState, Fragment, useEffect } from "react";
import { useQuery, useMutation, useApolloClient, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { Bell, Heart, MessageSquare, Inbox, Info, X, Loader as LoaderIcon, UserPlus } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { GET_NOTIFICATIONS } from "../../graphql/query/notificationQueries";
import { useUserStore } from "../../store/useAuthStore";
import { MARK_ALL_READ } from "../../graphql/mutation/notificationMutations";
import { io } from "socket.io-client";
import { toast } from "sonner";

const ENDPOINT = `http://${window.location.hostname}:3000`;

const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($scriptId: ID!) {
    acceptInvitation(scriptId: $scriptId) {
      id
    }
  }
`;

const DECLINE_INVITATION = gql`
  mutation DeclineInvitation($scriptId: ID!) {
    declineInvitation(scriptId: $scriptId) {
      id
    }
  }
`;

// 🚨 THE FIX: Smart Parser to format the notification strings beautifully
const parseNotificationMessage = (message: string, type: string) => {
    let primaryText = message;
    let secondaryText = "";

    try {
        if (type === "COMMENT") {
            // Extracts name and draft, throws away the comment text
            const match = message.match(/^(.*?)\s+commented(.*?)on\s+(?:your\s+)?(?:script|draft)?\s*(.*?)$/i);
            if (match) {
                primaryText = `${match[1].trim()} commented on your draft`;
                secondaryText = match[3].trim().replace(/^['"]|['"]$/g, ''); // Removes quotes if any
            }
        } else if (type === "REQUEST") {
            // Extracts first name and draft
            const match = message.match(/^(.*?)\s+invited you.*?on\s+(?:your\s+)?(?:script|draft)?\s*(.*?)$/i);
            if (match) {
                const firstName = match[1].trim().split(" ")[0]; // Only First Name
                primaryText = `${firstName} invited you to collaborate`;
                secondaryText = match[2].trim().replace(/^['"]|['"]$/g, '');
            }
        } else if (type === "LIKE") {
            const match = message.match(/^(.*?)\s+liked.*?(?:script|draft)?\s*(.*?)$/i);
            if (match) {
                primaryText = `${match[1].trim()} liked your draft`;
                secondaryText = match[2].trim().replace(/^['"]|['"]$/g, '');
            }
        }
    } catch (e) {
        console.error("Error parsing notification", e);
    }

    return { primaryText, secondaryText };
};

const NotificationModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [actionedNotifs, setActionedNotifs] = useState<Record<string, "ACCEPTED" | "DECLINED">>({});

    const { user } = useUserStore();
    const client = useApolloClient();

    const { data, loading, error } = useQuery(GET_NOTIFICATIONS, {
        variables: { userId: user?.id || "" },
        skip: !user?.id,
        fetchPolicy: "cache-and-network",
    });

    const notifications = data?.getNotifications || [];
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const [markAllRead] = useMutation(MARK_ALL_READ, {
        update(cache) {
            const existingData: any = cache.readQuery({
                query: GET_NOTIFICATIONS,
                variables: { userId: user?.id || "" },
            });

            if (existingData && existingData.getNotifications) {
                const updatedNotifications = existingData.getNotifications.map((notif: any) => ({
                    ...notif,
                    isRead: true,
                }));

                cache.writeQuery({
                    query: GET_NOTIFICATIONS,
                    variables: { userId: user?.id || "" },
                    data: {
                        getNotifications: updatedNotifications,
                    },
                });
            }
        },
    });

    const [acceptInvite, { loading: accepting }] = useMutation(ACCEPT_INVITATION);
    const [declineInvite, { loading: declining }] = useMutation(DECLINE_INVITATION);

    const handleAccept = (e: React.MouseEvent, scriptId: string, notifId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const promise = acceptInvite({ variables: { scriptId } }).then(() => {
            setActionedNotifs(prev => ({ ...prev, [notifId]: "ACCEPTED" }));
        });

        toast.promise(promise, {
            loading: "Accepting invitation...",
            success: "Invite Accepted! You are now a collaborator.",
            error: (err) => err.message || "Failed to accept invite.",
        });
    };

    const handleDecline = (e: React.MouseEvent, scriptId: string, notifId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const promise = declineInvite({ variables: { scriptId } }).then(() => {
            setActionedNotifs(prev => ({ ...prev, [notifId]: "DECLINED" }));
        });

        toast.promise(promise, {
            loading: "Declining invitation...",
            success: "Invite Declined.",
            error: (err) => err.message || "Failed to decline invite.",
        });
    };

    const extractScriptId = (link: string) => {
        if (!link) return "";
        const parts = link.split("/");
        return parts[parts.length - 1];
    };

    const handleCloseModal = () => {
        if (unreadCount > 0) {
            markAllRead();
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (!user?.id) return;

        const socket = io(ENDPOINT, {
            withCredentials: true,
        });

        socket.emit("setup", user.id);

        socket.on("new notification", (newNotif) => {
            client.cache.updateQuery(
                { query: GET_NOTIFICATIONS, variables: { userId: user.id } },
                (prev) => {
                    if (!prev || !prev.getNotifications) return prev;
                    if (prev.getNotifications.some((n: any) => n.id === newNotif.id)) return prev;

                    return {
                        getNotifications: [newNotif, ...prev.getNotifications],
                    };
                }
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id, client]);

    const getIcon = (type: string) => {
        switch (type) {
            case "LIKE": return <Heart className="w-4 h-4 text-gray-400" />;
            case "COMMENT": return <MessageSquare className="w-4 h-4 text-gray-400" />;
            case "REQUEST": return <UserPlus className="w-4 h-4 text-gray-400" />;
            default: return <Info className="w-4 h-4 text-gray-400" />;
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((new Date().getTime() - Number(timestamp)) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <Fragment>
            <button
                onClick={() => setIsOpen(true)}
                className={`group flex items-center gap-3 py-1 transition-all duration-300 outline-none relative overflow-hidden w-full font-mono ${isOpen ? "font-bold text-white pl-3" : "text-gray-400 hover:text-white pl-0"}`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 transition-transform duration-300 ease-out origin-center ${isOpen ? "scale-y-100" : "scale-y-0"}`} />
                <div className="relative flex items-center justify-center">
                    <Bell className={`w-5 h-5 shrink-0 transition-all duration-300 ${isOpen ? "stroke-[2.5px] scale-110 ml-1" : "stroke-2 opacity-70 group-hover:opacity-100 group-hover:scale-110"}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5 z-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border border-[#161620]"></span>
                        </span>
                    )}
                </div>
                <span className="text-lg font-medium">Notifications</span>
            </button>

            <Dialog open={isOpen} onClose={handleCloseModal} className="relative z-50 font-mono">
                <DialogBackdrop transition className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full max-w-xl h-[550px] transform overflow-hidden rounded-2xl bg-primary border border-white/10 text-left shadow-2xl transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 flex flex-col"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5 shrink-0">
                            <DialogTitle as="h3" className="text-xl font-bold text-white font-sans tracking-tight">
                                Notifications
                            </DialogTitle>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                            {loading && !notifications.length ? (
                                <div className="flex justify-center items-center h-full">
                                    <LoaderIcon className="animate-spin text-white w-8 h-8 opacity-50" />
                                </div>
                            ) : error ? (
                                <div className="p-6 text-center text-red-400 font-semibold h-full flex items-center justify-center">
                                    Failed to load notifications.
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                    <Bell className="w-12 h-12 text-gray-700" />
                                    <h4 className="text-lg font-bold text-white opacity-40">All caught up!</h4>
                                </div>
                            ) : (
                                notifications.map((notif: any) => {
                                    // 🚨 THE FIX: Use our new parser to get clean text
                                    const { primaryText, secondaryText } = parseNotificationMessage(notif.message, notif.type);

                                    return (
                                        <Link
                                            to={notif.link || "#"}
                                            key={notif.id}
                                            onClick={handleCloseModal}
                                            className={`flex items-start gap-4 p-5 border-b border-white/5 hover:bg-white/5 transition-colors group ${!notif.isRead ? "bg-blue-500/[0.03]" : ""}`}
                                        >
                                            <div className={`shrink-0 mt-0.5 size-10 rounded-full border flex items-center justify-center transition-colors bg-white/5 border-white/10`}>
                                                {getIcon(notif.type)}
                                            </div>

                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <p className={`text-sm leading-snug font-sans ${!notif.isRead ? "text-white font-semibold" : "text-gray-300"}`}>
                                                    {primaryText}
                                                </p>

                                                {/* 🚨 THE FIX: Renders the clean draft name below */}
                                                {secondaryText && (
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                        Draft: <span className="text-gray-300 font-semibold">{secondaryText}</span>
                                                    </p>
                                                )}

                                                {notif.type === "REQUEST" && (
                                                    <div className="mt-2">
                                                        {actionedNotifs[notif.id] === "ACCEPTED" ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-500/20">
                                                                Accepted ✓
                                                            </span>
                                                        ) : actionedNotifs[notif.id] === "DECLINED" ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-gray-400 text-[11px] font-bold uppercase tracking-wider border border-white/10">
                                                                Declined ✕
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    disabled={accepting || declining}
                                                                    onClick={(e) => handleAccept(e, extractScriptId(notif.link), notif.id)}
                                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-md transition-all disabled:opacity-50"
                                                                >
                                                                    {accepting ? "..." : "Accept"}
                                                                </button>
                                                                <button
                                                                    disabled={accepting || declining}
                                                                    onClick={(e) => handleDecline(e, extractScriptId(notif.link), notif.id)}
                                                                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[11px] font-bold uppercase tracking-wider rounded-md transition-all disabled:opacity-50"
                                                                >
                                                                    {declining ? "..." : "Decline"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end justify-start gap-1.5 shrink-0 pt-0.5">
                                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-400 transition-colors whitespace-nowrap">
                                                    {formatTimeAgo(notif.createdAt)}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </Fragment>
    );
};

export default NotificationModal;