import Notification from "../../../models/Notification";

export const notificationMutations = {
    markAllNotificationsRead: async (_: any, __: any, context: any) => {
        const userId = context.user?.id;
        if (!userId) return false;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { $set: { isRead: true } }
        );
        return true;
    },

    deleteNotification: async (_: any, { id }: { id: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) return false;

        const result = await Notification.findOneAndDelete({
            _id: id,
            recipient: userId
        });

        return !!result;
    }
};