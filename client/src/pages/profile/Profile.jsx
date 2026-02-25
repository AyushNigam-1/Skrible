import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import {
    User,
    Languages,
    AlignLeft,
    Mail,
    Heart,
    Eye,
    Users,
    Settings,
    Rss,
    MapPin,
    CalendarDays
} from 'lucide-react';
import { GET_USER_PROFILE } from '../../graphql/query/userQueries';
import Loader from '../../components/Loader';

const Profile = () => {
    const { username } = useParams();

    // Safely parse current user from localStorage to show/hide "Follow" or "Settings"
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser).username : null;
    const isOwnProfile = currentUser === username;

    const { data, loading, error } = useQuery(GET_USER_PROFILE, {
        variables: { username },
        skip: !username,
    });

    if (loading) return <Loader height="70vh" />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[70vh] gap-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full text-red-600 dark:text-red-400">
                    <User className="w-10 h-10" />
                </div>
                {/* APPLIED PLAYFAIR DISPLAY */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-['Playfair_Display']">Profile not found</h2>
                {/* APPLIED CRIMSON PRO */}
                <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center font-['Crimson_Pro'] text-lg">{error.message}</p>
            </div>
        );
    }

    const userProfile = data?.getUserProfile;

    // Structure for the main details panel
    const userDetails = [
        { title: 'Full Name', value: userProfile?.username || 'Not provided', icon: User },
        { title: 'Bio', value: userProfile?.bio || 'This user prefers to keep an air of mystery about them.', icon: AlignLeft },
        { title: 'Email', value: userProfile?.email || 'Not provided', icon: Mail },
        { title: 'Languages', value: userProfile?.languages?.join(', ') || 'Not provided', icon: Languages },
        { title: 'Interests', value: userProfile?.interests?.join(', ') || 'Not provided', icon: Heart },
    ];

    // Structure for the quick stats sidebar
    const statsInfo = [
        { title: 'Profile Views', value: userProfile?.views.length || 0, icon: Eye },
        { title: 'Total Likes', value: userProfile?.likes?.length || 0, icon: Heart },
        { title: 'Followers', value: userProfile?.followers?.length || 0, icon: Users },
    ];

    // Helper to extract a single letter avatar
    const initial = userProfile?.username?.charAt(0).toUpperCase() || '?';

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">

            {/* --- Header --- */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                {/* APPLIED PLAYFAIR DISPLAY TO PAGE TITLE */}
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-['Playfair_Display']">
                    {isOwnProfile ? 'My Profile' : 'User Profile'}
                </h1>

                {isOwnProfile && (
                    <Link to="/setting" className="flex items-center gap-2 bg-white/5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm">
                        <Settings size={20} />
                        Settings
                    </Link>
                )}
            </div>
            <hr className="border-gray-200 dark:border-gray-800" />

            <div className="flex flex-col lg:flex-row gap-6">

                {/* --- Left Sidebar (Avatar & Actions) --- */}
                <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">

                    {/* Identity Card */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center gap-4">
                        {/* Avatar */}
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black shadow-inner border-4 border-white dark:border-gray-800">
                            {initial}
                        </div>

                        <div>
                            {/* APPLIED PLAYFAIR DISPLAY TO USERNAME */}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-['Playfair_Display'] tracking-wide">
                                {userProfile?.username}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                                @{userProfile?.username?.toLowerCase()}
                            </p>
                        </div>

                        {/* Location / Join Date */}
                        <div className="flex flex-col gap-2 mt-2 w-full text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <div className="flex items-center justify-center gap-1.5">
                                <MapPin className="w-4 h-4" /> Earth
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                                <CalendarDays className="w-4 h-4" /> Joined recently
                            </div>
                        </div>
                    </div>

                    {/* Stats & Actions Card */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col gap-4">

                        {/* Stats Map */}
                        <div className="flex flex-col gap-3">
                            {statsInfo.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                                            <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                            {stat.title}
                                        </div>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        {!isOwnProfile && (
                            <div className="flex flex-col gap-3">
                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors font-['Playfair_Display'] tracking-wide">
                                    <Rss className="w-5 h-5" /> Follow
                                </button>
                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors font-['Playfair_Display'] tracking-wide">
                                    <Heart className="w-5 h-5 text-pink-500" /> Like Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Main Details Panel --- */}
                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 rounded-2xl shadow-sm">
                    {/* APPLIED PLAYFAIR DISPLAY */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 font-['Playfair_Display']">
                        About User
                    </h3>

                    <div className="flex flex-col gap-8">
                        {userDetails.map((detail, idx) => {
                            const Icon = detail.icon;
                            return (
                                <div key={idx} className="flex flex-col gap-2">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <Icon className="w-4 h-4 text-blue-500" />
                                        {detail.title}
                                    </h4>
                                    {/* APPLIED CRIMSON PRO */}
                                    <p className={`text-xl font-medium font-['Crimson_Pro'] leading-relaxed ${detail.value === 'Not provided'
                                        ? 'text-gray-400 italic'
                                        : 'text-gray-900 dark:text-gray-100'
                                        }`}>
                                        {detail.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;