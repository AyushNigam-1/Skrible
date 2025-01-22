import User from "../../../models/User";

export const userQueries = {
    getUserProfile: async (_: unknown, { id }: { id: string }) => {
        try {
            const user = await User.findById(id)
                .populate('scripts')
                .populate('likes')
                .populate('followers')
                .populate('follows')
                .populate('views');

            if (!user) {
                throw new Error('User not found');
            }

            return {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                languages: user.languages || [],
                interests: user.interests || [],
                likes: user.likes || [],
                followers: user.followers || [],
                follows: user.follows || [],
                scripts: user.scripts || [],
                views: user.views || [],
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    },
};
