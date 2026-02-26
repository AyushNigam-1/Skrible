import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Save, Trash2, AlertTriangle, Lock, Globe2 } from 'lucide-react';
import { DELETE_SCRIPT, UPDATE_SCRIPT } from '../../graphql/mutation/scriptMutations';

const DraftSettings = () => {
    const navigate = useNavigate();
    // Grab the script data passed down from DraftLayout
    const { data } = useOutletContext();
    const script = data?.getScriptById;

    // Get current user to ensure only the author can see/edit settings
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isAuthor = currentUser?.id === script?.author?.id;

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('Public');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Initialize state when script data loads
    useEffect(() => {
        if (script) {
            setTitle(script.title || '');
            setDescription(script.description || '');
            setVisibility(script.visibility || 'Public');
        }
    }, [script]);

    // Mutations
    const [deleteScript, { loading: isDeleting }] = useMutation(DELETE_SCRIPT);
    const [updateScript, { loading: isUpdating }] = useMutation(UPDATE_SCRIPT);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await updateScript({
                variables: {
                    scriptId: script.id,
                    title,
                    description,
                    visibility
                }
            });
            alert("Settings saved successfully!");
        } catch (err) {
            console.error("Failed to update:", err);
            alert("Failed to save settings. Please try again.");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteScript({ variables: { scriptId: script.id } });
            navigate('/explore'); // Redirect user after deleting
        } catch (err) {
            console.error("Failed to delete script:", err);
            alert("Failed to delete the draft. Please try again.");
        }
    };

    return (
        // APPLIED INTER GLOBALLY FOR CRISP UI ALIGNMENT
        <div className="flex flex-col gap-8 mx-auto pb-12 font-['Inter']">

            {/* --- GENERAL SETTINGS (GLASSMORPHISM) --- */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update the core details of your draft.</p>
                </div>

                <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
                    {/* Title Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Draft Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 text-gray-900 dark:text-white rounded-xl py-2.5 px-4 outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-sm"
                            placeholder="Enter your script title..."
                            required
                        />
                    </div>

                    {/* Description Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Description</label>
                        {/* APPLIED LITERATA TO TEXTAREA */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none transition-all resize-none font-['Literata'] text-lg leading-relaxed placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-['Inter'] shadow-sm"
                            placeholder="What is this draft about?"
                        />
                    </div>

                    {/* Visibility Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Visibility</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${visibility === 'Public' ? 'border-blue-500/50 bg-blue-500/10' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}>
                                <input type="radio" name="visibility" value="Public" checked={visibility === 'Public'} onChange={() => setVisibility('Public')} className="mt-1 sr-only" />
                                <Globe2 className={`w-5 h-5 ${visibility === 'Public' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                <div>
                                    <p className={`font-semibold ${visibility === 'Public' ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'}`}>Public</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Anyone can view and request to contribute.</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${visibility === 'Private' ? 'border-blue-500/50 bg-blue-500/10' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}>
                                <input type="radio" name="visibility" value="Private" checked={visibility === 'Private'} onChange={() => setVisibility('Private')} className="mt-1 sr-only" />
                                <Lock className={`w-5 h-5 ${visibility === 'Private' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                <div>
                                    <p className={`font-semibold ${visibility === 'Private' ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'}`}>Private</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Only you can view and edit this draft.</p>
                                </div>
                            </label>

                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-md"
                        >
                            <Save className="w-4 h-4" />
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- DANGER ZONE (TRANSLUCENT RED) --- */}
            <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-red-500/20">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">Actions here cannot be undone. Please be certain.</p>
                </div>

                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Delete this Draft</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Once you delete a draft, there is no going back. All paragraphs and comments will be erased.</p>
                    </div>

                    {!isConfirmingDelete ? (
                        <button
                            onClick={() => setIsConfirmingDelete(true)}
                            className="shrink-0 px-5 py-2.5 border-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition-colors shadow-sm"
                        >
                            Delete Draft
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={() => setIsConfirmingDelete(false)}
                                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gray-800 dark:text-gray-200 border border-white/10 rounded-xl font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-md"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Yes, Delete It'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default DraftSettings;