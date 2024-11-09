import React from 'react'

const Profile = () => {
    return (
        <div className='flex container mx-auto bg-white rounded-md p-4 gap-3' >
            <div className='flex flex-col gap-3 w-80' >
                <img src="/person.jpg" className='rounded-full ' alt="" />
                <hr />
                <div className='flex gap-2 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        Views  </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' >45</p>
                    </span>
                    <hr />
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>

                        Views  </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' >45</p>
                    </span>

                </div>
            </div>

            <div className='flex gap-3 flex-col' >
                <div className='flex gap-1 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Name  </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' >Ayush Nigam</p>
                    </span>
                </div>
                <hr />
                <div className='flex gap-1 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                        </svg>
                        Languages
                    </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' >English , Hindi</p>
                    </span>
                </div>
                <hr />
                <div className='flex gap-1 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        Location
                        {/* <span className='bg-indigo-500 rounded-full p-1 px-2.5 text-white text-sm' > 2
                                </span>  */}
                    </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' > Not Provided</p>
                    </span>
                </div>
                <hr />

                <div className='flex gap-2 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>
                        Bio
                    </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' >
                            Introverted but driven, with a big-picture mindset and a passion for tech. I’m all about deep conversations, connecting on a meaningful level, and personal growth. If you're someone who values growing together mentally and physically, we’ll get along just fine. Let’s inspire each other and see where it goes.
                        </p>
                    </span>
                    {/* <div className='flex gap-3 flex-wrap' >
                        {
                            [
                                { genre: 'Horror', bg: 'bg-red-100', color: 'text-red-800' },
                                { genre: 'Action', bg: 'bg-blue-100', color: 'text-blue-800' },
                                { genre: 'Comedy', bg: 'bg-yellow-100', color: 'text-yellow-800' },
                                { genre: 'Drama', bg: 'bg-green-100', color: 'text-green-800' },
                                { genre: 'Sci-Fi', bg: 'bg-purple-100', color: 'text-purple-800' },
                                { genre: 'Fantasy', bg: 'bg-indigo-100', color: 'text-indigo-800' },
                                { genre: 'Thriller', bg: 'bg-orange-100', color: 'text-orange-800' },
                                { genre: 'Romance', bg: 'bg-pink-100', color: 'text-pink-800' },
                                { genre: 'Mystery', bg: 'bg-gray-100', color: 'text-gray-800' },
                                { genre: 'Animation', bg: 'bg-teal-100', color: 'text-teal-800' }
                            ].map(({ genre, bg, color }) => {
                                return <p className='text-lg font-semibold text-gray-800 py-1 px-2 bg-gray-100 rounded-full' > # {genre}  </p>
                               
                            })
                        }
                    </div> */}
                </div>
                <div className='flex gap-1 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
                        </svg>
                        Intrests
                    </h4>
                    <div className='flex gap-3 flex-wrap' >
                        {
                            [
                                { genre: 'Horror', bg: 'bg-red-100', color: 'text-red-800' },
                                { genre: 'Action', bg: 'bg-blue-100', color: 'text-blue-800' },
                                { genre: 'Comedy', bg: 'bg-yellow-100', color: 'text-yellow-800' },
                                { genre: 'Drama', bg: 'bg-green-100', color: 'text-green-800' },
                                { genre: 'Sci-Fi', bg: 'bg-purple-100', color: 'text-purple-800' },
                                { genre: 'Fantasy', bg: 'bg-indigo-100', color: 'text-indigo-800' },
                                { genre: 'Thriller', bg: 'bg-orange-100', color: 'text-orange-800' },
                                { genre: 'Romance', bg: 'bg-pink-100', color: 'text-pink-800' },
                                { genre: 'Mystery', bg: 'bg-gray-100', color: 'text-gray-800' },
                                { genre: 'Animation', bg: 'bg-teal-100', color: 'text-teal-800' }
                            ].map(({ genre, bg, color }) => {
                                return <p className='text-lg font-semibold text-gray-800 py-1 px-2 bg-gray-100 rounded-full' > # {genre}  </p>
                            })
                        }
                    </div>
                    {/* <span className='flex items-center gap-2' >
                        <p className='text-lg font-semibold text-gray-800' > Not Provided</p>
                    </span> */}
                </div>
                {/* </span> */}
            </div>
        </div>
    )
}

export default Profile