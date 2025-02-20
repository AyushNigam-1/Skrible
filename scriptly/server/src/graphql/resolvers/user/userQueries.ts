import Script from "../../../models/Script";
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
    getUserScripts: async (_: unknown, { userId }: { userId: string }) => {

        try {
            const scripts = await Script.find({ author: userId }).populate('author');

            if (!scripts || scripts.length === 0) {
                throw new Error('No scripts found for this user');
            }

            return scripts;
        } catch (error: any) {
            throw new Error(error.message);
        }
    },
    getUserContributions: async (_: any, { _id }: { _id: string }) => {
        const user = await User.findById(_id).lean();
        if (!user) return [];

        // Find scripts that contain the user's contributions
        const scripts = await Script.find(
            { "requests._id": { $in: user.contributions } },
            { "requests.$": 1, title: 1 } // Retrieve only the matching requests
        )
            .populate({
                path: "requests.author",
                select: "username email",
            })
            .lean();

        // Extract the requests from scripts
        console.log(scripts);
        const contributions = scripts.flatMap(script =>
            script.requests.map(request => ({
                scriptId: script._id,
                scriptTitle: script.title,
                ...request
            }))
        );
        return contributions;
    }

};
