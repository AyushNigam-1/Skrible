import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    User,
    Mail,
    Save,
    Camera,
    Trash2,
    Check,
    AlertCircle,
    Globe,
    Heart,
    Loader2
} from 'lucide-react';
import { GET_USER_PROFILE } from '../../graphql/query/userQueries';
import { UPDATE_USER_PROFILE } from '../../graphql/mutation/userMutations';
import Loader from '../../components/Loader';

const UserSettings = () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const initialUsername = currentUser?.username;

    // State management
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        languages: '',
        interests: ''
    });
    const [successMsg, setSuccessMsg] = useState('');

    // Query to get fresh data
    const { data, loading, refetch } = useQuery(GET_USER_PROFILE, {
        variables: { username: initialUsername },
        skip: !initialUsername,
    });

    // Mutation to save changes
    const [updateProfile, { loading: isUpdating }] = useMutation(UPDATE_USER_PROFILE);

    useEffect(() => {
        if (data?.getUserProfile) {
            const user = data.getUserProfile;
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                languages: user.languages?.join(', ') || '',
                interests: user.interests?.join(', ') || ''
            });
        }
    }, [data]);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const { data: updateData } = await updateProfile({
                variables: {
                    username: formData.username,
                    bio: formData.bio,
                    languages: formData.languages.split(',').map(s => s.trim()).filter(s => s !== ""),
                    interests: formData.interests.split(',').map(s => s.trim()).filter(s => s !== "")
                }
            });

            if (updateData?.updateUserProfile) {
                // SYNC LOCAL STORAGE
                const updatedStoredUser = {
                    ...currentUser,
                    username: updateData.updateUserProfile.username
                };
                localStorage.setItem('user', JSON.stringify(updatedStoredUser));

                setSuccessMsg('Profile updated successfully!');

                // Refetch to ensure the UI has the latest data from server
                refetch({ username: updateData.updateUserProfile.username });

                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update profile. Username might already be taken.");
        }
    };

    if (loading) return <Loader height="70vh" />;

    return (
        <div className="max-w-6xl mx-auto w-full pb-20 font-['Inter']">
            {/* Header */}
            {/* <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account settings and preferences.
                </p>
            </div> */}

            {/* --- Main Content Area (All Sections Stacked) --- */}
            <div className="w-full space-y-12">

                {/* SECTION 1: PROFILE */}
                <div id="profile" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-1">Profile Details</h2>
                        <p className="text-sm text-gray-400">Update your public identity and bio.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/10">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-inner border-4 border-white/10">
                                    {formData.username.charAt(0).toUpperCase() || "?"}
                                </div>
                                <button type="button" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white/10 hover:scale-110 transition-transform">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Picture</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 800K</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email (Read Only) */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                <div className="relative opacity-60">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio - Literata Font */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-['Literata'] text-lg leading-relaxed"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Languages (comma separated)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        name="languages"
                                        value={formData.languages}
                                        onChange={handleInputChange}
                                        placeholder="English, French..."
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Interests</label>
                                <div className="relative">
                                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleInputChange}
                                        placeholder="Sci-Fi, Screenwriting..."
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                            <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                                {successMsg && <><Check size={16} className="animate-bounce" /> {successMsg}</>}
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30 active:scale-95"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* SECTION 2: ACCOUNT (DANGER ZONE) */}
                <div id="account" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-1">Account Security</h2>
                        <p className="text-sm text-gray-400">Manage your account lifecycle and data.</p>
                    </div>

                    <div className="p-6 border border-red-500/20 bg-red-500/5 backdrop-blur-md rounded-2xl shadow-xl">
                        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
                            <AlertCircle size={20} />
                            Danger Zone
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Deleting your account is permanent and cannot be undone. All your drafts and contributions will be lost.
                        </p>
                        <button className="flex items-center gap-2 border border-red-500/30 text-red-500 px-6 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95">
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* SECTION 3: APPEARANCE */}
                <div id="appearance" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-1">Appearance</h2>
                        <p className="text-sm text-gray-400">Customize how the app looks on your device.</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Theme Settings</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Theme management is handled globally by your system preferences.
                            <br />Dark mode is currently active via the starry-night global background.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserSettings;