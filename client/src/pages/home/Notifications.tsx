import { useState, Fragment, useEffect } from "react";
import { useQuery, useMutation, useApolloClient, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { Bell, Heart, MessageSquare, Inbox, Info, X, Loader as LoaderIcon, UserPlus } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { GET_NOTIFICATIONS } from "../../graphql/query/notificationQueries";
import { useUserStore } from "../../store/useAuthStore";
import { MARK_ALL_READ } from "../../graphql/mutation/notificationMutations";
import { io } from "socket.io-client";

const ENDPOINT = `http://${window.location.hostname}:3000`;

// 🚨 1. Add the new Collaboration Mutations
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

const NotificationModal = () => {
    const [isOpen, setIsOpen] = useState(false);
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
        onCompleted: () => console.log("All notifications marked as read"),
        onError: (err) => console.error("Mutation Error:", err)
    });

    // 🚨 2. Initialize the Invite Mutations
    const [acceptInvite, { loading: accepting }] = useMutation(ACCEPT_INVITATION, {
        onCompleted: () => alert("Invite Accepted! You are now a collaborator."),
        onError: (err) => alert(err.message)
    });

    const [declineInvite, { loading: declining }] = useMutation(DECLINE_INVITATION, {
        onCompleted: () => alert("Invite Declined."),
        onError: (err) => alert(err.message)
    });

    // Helper to extract the Script ID from the notification link
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
            console.log("🔵 CAUGHT SOCKET.IO PAYLOAD:", newNotif);

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
            case "LIKE": return <Heart className="w-4 h-4 text-pink-500" />;
            case "COMMENT": return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case "REQUEST": return <Inbox className="w-4 h-4 text-amber-500" />;
            // case "COLLAB_INVITE": return <UserPlus className="w-4 h-4 text-emerald-500" />; // 🚨 Added explicit icon for invites
            default: return <Info className="w-4 h-4 text-gray-400" />;
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((new Date().getTime() - Number(timestamp)) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
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
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#161620]"></span>
                        </span>
                    )}
                </div>
                <span className="text-lg font-medium">Notifications</span>
            </button>

            <Dialog open={isOpen} onClose={handleCloseModal} className="relative z-50 font-mono">
                <DialogBackdrop transition className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ease-out data-[closed]:opacity-0" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full max-w-2xl h-[500px] transform overflow-hidden rounded-3xl bg-[#161620] border border-white/10 text-left shadow-2xl transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5 shrink-0">
                            <DialogTitle as="h3" className="text-2xl font-extrabold text-white font-sans tracking-tight">
                                Notifications
                            </DialogTitle>
                            <button onClick={handleCloseModal} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                            {loading && !notifications.length ? (
                                <div className="flex justify-center items-center h-full">
                                    <LoaderIcon className="animate-spin text-white w-10 h-10 opacity-50" />
                                </div>
                            ) : error ? (
                                <div className="p-6 text-center text-red-400 font-semibold h-full flex items-center justify-center">
                                    Failed to load notifications.
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                    <Bell className="w-16 h-16 text-gray-700" />
                                    <h4 className="text-xl font-bold text-white opacity-40">All caught up!</h4>
                                </div>
                            ) : (
                                notifications.map((notif: any) => (
                                    <Link
                                        to={notif.link || "#"}
                                        key={notif.id}
                                        onClick={handleCloseModal}
                                        className={`flex gap-4 p-5 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.isRead ? "bg-white/[0.03]" : ""}`}
                                    >
                                        <div className="shrink-0 mt-1 size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <p className={`text-base leading-relaxed font-sans ${!notif.isRead ? "text-white font-semibold" : "text-gray-300"}`}>
                                                {notif.message}
                                            </p>

                                            {notif.type === "REQUEST" && (
                                                <div className="flex items-center gap-3 mt-3">
                                                    <button
                                                        disabled={accepting || declining}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation(); // Stops the <Link> from triggering
                                                            acceptInvite({ variables: { scriptId: extractScriptId(notif.link) } });
                                                        }}
                                                        className="px-5 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {accepting ? "Accepting..." : "Accept"}
                                                    </button>
                                                    <button
                                                        disabled={accepting || declining}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            declineInvite({ variables: { scriptId: extractScriptId(notif.link) } });
                                                        }}
                                                        className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {declining ? "Declining..." : "Decline"}
                                                    </button>
                                                </div>
                                            )}

                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                {formatTimeAgo(notif.createdAt)}
                                            </span>
                                        </div>
                                        {!notif.isRead && <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500 mt-2" />}
                                    </Link>
                                ))
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </Fragment>
    );
};

export default NotificationModal;