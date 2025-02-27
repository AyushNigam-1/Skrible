import { useMutation } from '@apollo/client';
import React from 'react';
import { ADD_SCRIPT } from '../../graphql/mutation/scriptMutations';
import { useNavigate } from 'react-router-dom';

const Add = () => {
    const navigate = useNavigate();

    const [add_script, { loading, error }] = useMutation(ADD_SCRIPT);

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
            <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black text-gray-500 ">Add New Script</h3>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="flex gap-2 items-center text-lg  bg-gray-200/50 text-gray-600 text-md py-4 px-6 rounded-lg"
                    >{loading ? <svg aria-hidden="true" className="w-6 h-6 text-gray-400 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg> :
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
                        </svg>}
                        <h6 className="text-lg">  Upload</h6>
                    </button>
                </div>
            </div>
            <div className="flex gap-3">
                {/* <div className="bg-white rounded-md p-2 shadow-sm">
                    <img src="/person.jpg" className="rounded-full w-52" alt="" />
                </div> */}
                <div className="bg-gray-200/50 rounded-md p-2 w-full shadow-sm flex gap-2 flex-col">
                    <div className="flex gap-3">
                        <div className="w-full">
                            <label htmlFor="title" className="block text-lg font-bold text-gray-500">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name='title'
                                className="rounded-lg bg-white outline-none p-3 w-full mt-1.5"
                                placeholder="Please select"
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="language" className="block text-lg font-bold text-gray-500">
                                Language
                            </label>
                            <div className="relative mt-1.5">
                                <input
                                    type="text"
                                    name='languages'
                                    list="HeadlineActArtist"
                                    id="language"
                                    className="rounded-lg bg-white outline-none p-3 w-full"
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
                            <label htmlFor="visibility" className="block text-lg font-bold text-gray-500">
                                Visibility
                            </label>
                            <select
                                name="visibility"
                                id="visibility"
                                className="mt-1.5 rounded-lg bg-white outline-none p-3 w-full"
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
                        <label htmlFor="HeadlineAct" className="block text-lg font-bold text-gray-500">
                            Genres
                        </label>
                        <div className="relative mt-1.5">
                            <input
                                type="text"
                                name='genres'
                                list="HeadlineActArtist"
                                id="HeadlineAct"
                                className="rounded-lg bg-white outline-none p-3 w-full"
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
            <div className="w-full bg-gray-200/50 p-3 rounded-md shadow-sm">
                <label htmlFor="HeadlineAct" className="block text-lg font-bold text-gray-500">
                    Description
                </label>
                <textarea
                    name='description'
                    type="text"
                    rows={6}
                    className="rounded-lg bg-white outline-none p-3 w-full mt-1.5"
                    placeholder=""
                />
            </div>
            <div className="w-full bg-gray-200/50 p-3 rounded-md">
                <label htmlFor="HeadlineAct" className="block text-lg font-bold text-gray-500">
                    Script
                </label>
                <textarea
                    name='script'
                    type="text"
                    rows={18}
                    className="rounded-lg bg-white outline-none p-3 w-full mt-1.5"
                    placeholder=""
                />
            </div>
        </form>
    );
};

export default Add;
