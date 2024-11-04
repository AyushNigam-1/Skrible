import React from 'react'

const Profile = () => {
    return (
        <div className='flex container mx-auto bg-white rounded-md p-4 gap-3' >
            <img src="/person.jpg" className='rounded-full w-40 h-40' alt="" />
            <div className='flex gap-3 flex-col' >
                <div className='flex gap-1 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Script  </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' >Untitled</p>
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
                        <p className='text-lg font-semibold text-gray-800' >English</p>
                    </span>
                </div>
                <hr />
                <div className='flex gap-1 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                        Contributors
                        {/* <span className='bg-indigo-500 rounded-full p-1 px-2.5 text-white text-sm' > 2
                                </span>  */}
                    </h4>
                    <span className='flex items-center gap-2' >
                        {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                        <p className='text-lg font-semibold text-gray-800' > Ayush Nigam</p>
                    </span>
                </div>
                <hr />

                <div className='flex gap-2 flex-col'>
                    <h4 className='text-md text-gray-600 font-medium flex items-center gap-1' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>
                        Genres
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
                                // <span className={`flex items-center gap-3 text-sm rounded-full`} >
                                //     {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                                //     <p className='text-lg   p-1' >{genre}</p>
                                // </span>
                            })
                        }
                    </div>
                </div>
                {/* </span> */}
            </div>
        </div>
    )
}

export default Profile