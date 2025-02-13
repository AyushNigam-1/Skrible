import { useMutation } from '@apollo/client';
import React from 'react';
import { ADD_SCRIPT } from '../../graphql/mutation/scriptMutations';
import { useNavigate } from 'react-router-dom';

const Add = () => {
    const navigate = useNavigate();

    const [add_script] = useMutation(ADD_SCRIPT);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            languages: formData.get('languages').split(','), // Split language by commas
            visibility: formData.get('visibility'),
            description: formData.get('description'),
            genres: formData.get('genres').split(','), // Split genres by commas
            paragraph: formData.get('script')
        };
        try {
            const response = await add_script({ variables: data });
            console.log('Script added:', response.data.createScript);
            navigate(`/script/${response.data.createScript.id}`);

            alert('Script added successfully!');
            e.target.reset();
        } catch (error) {
            console.error('Error adding script:', error);
            alert('Failed to add script!');
        }
    };


    return (
        <form onSubmit={handleSubmit} className="flex gap-3 flex-col">
            <div className="flex justify-between">
                <h3 className="font-sans text-3xl font-bold text-gray-800">Add New Script</h3>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="flex gap-2 items-center text-sm shadow bg-indigo-400 text-white text-md px-3 py-2 rounded-md"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                            />
                        </svg>
                        <h6 className="text-lg">Upload</h6>
                    </button>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="bg-white rounded-md p-2 shadow-sm">
                    <img src="/person.jpg" className="rounded-full w-52" alt="" />
                </div>
                <div className="bg-white rounded-md p-2 w-full shadow-sm flex gap-2 flex-col">
                    <div className="flex gap-3">
                        <div className="w-full">
                            <label htmlFor="title" className="block text-lg font-bold text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name='title'
                                className="w-full rounded-lg mt-1.5 border-gray-300 border-2 text-gray-700 sm:text-sm bg-transparent p-3"
                                placeholder="Please select"
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="language" className="block text-lg font-bold text-gray-700">
                                Language
                            </label>
                            <div className="relative mt-1.5">
                                <input
                                    type="text"
                                    name='languages'
                                    list="HeadlineActArtist"
                                    id="language"
                                    className="w-full rounded-lg border-gray-300 border-2 text-gray-700 sm:text-sm bg-transparent p-3"
                                    placeholder="Please select"
                                />
                                <span className="absolute inset-y-0 end-0 flex w-8 items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="size-5 text-gray-500"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <datalist name="HeadlineAct" id="HeadlineActArtist">
                                <option value="JM">John Mayer</option>
                                <option value="SRV">Stevie Ray Vaughn</option>
                                <option value="JH">Jimi Hendrix</option>
                                <option value="BBK">B.B King</option>
                                <option value="AK">Albert King</option>
                                <option value="BG">Buddy Guy</option>
                                <option value="EC">Eric Clapton</option>
                            </datalist>
                        </div>
                        <div className="w-full">
                            <label htmlFor="visibility" className="block text-lg font-bold text-gray-700">
                                Visibility
                            </label>
                            <select
                                name="visibility"
                                id="visibility"
                                className="mt-1.5 w-full rounded-lg border-gray-300 border-2 text-gray-700 sm:text-sm bg-transparent p-3"
                            >
                                <option value="">Please select</option>
                                <option value="JM">John Mayer</option>
                                <option value="SRV">Stevie Ray Vaughn</option>
                                <option value="JH">Jimi Hendrix</option>
                                <option value="BBK">B.B King</option>
                                <option value="AK">Albert King</option>
                                <option value="BG">Buddy Guy</option>
                                <option value="EC">Eric Clapton</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full">
                        <label htmlFor="HeadlineAct" className="block text-lg font-bold text-gray-700">
                            Genres
                        </label>
                        <div className="relative mt-1.5">
                            <input
                                type="text"
                                name='genres'
                                list="HeadlineActArtist"
                                id="HeadlineAct"
                                className="w-full rounded-lg border-gray-300 border-2 text-gray-700 sm:text-sm bg-transparent p-3"
                                placeholder="Please select"
                            />
                            <span className="absolute inset-y-0 end-0 flex w-8 items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-5 text-gray-500"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                                    />
                                </svg>
                            </span>
                        </div>
                        <datalist name="HeadlineAct" id="HeadlineActArtist">
                            <option value="JM">John Mayer</option>
                            <option value="SRV">Stevie Ray Vaughn</option>
                            <option value="JH">Jimi Hendrix</option>
                            <option value="BBK">B.B King</option>
                            <option value="AK">Albert King</option>
                            <option value="BG">Buddy Guy</option>
                            <option value="EC">Eric Clapton</option>
                        </datalist>
                    </div>
                </div>
            </div>
            <div className="w-full bg-white p-3 rounded-md shadow-sm">
                <label htmlFor="HeadlineAct" className="block text-lg font-bold text-gray-700">
                    Description
                </label>
                <textarea
                    name='description'
                    type="text"
                    rows={6}
                    className="w-full rounded-lg mt-1.5 border-gray-300 border-2 text-gray-700 sm:text-sm bg-transparent p-3"
                    placeholder=""
                />
            </div>
            <div className="w-full bg-white p-3 rounded-md">
                <label htmlFor="HeadlineAct" className="block text-lg font-bold text-gray-700">
                    Script
                </label>
                <textarea
                    name='script'
                    type="text"
                    rows={18}
                    className="w-full rounded-lg mt-1.5 border-gray-300 border-2 text-gray-700 sm:text-sm bg-transparent p-3"
                    placeholder=""
                />
            </div>
        </form>
    );
};

export default Add;
