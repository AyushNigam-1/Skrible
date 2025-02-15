import React, { useRef } from 'react'
const Genres = () => {
    const genres = [
        { name: "Fantasy", color: "bg-purple-100", textColor: "text-purple-600" },
        { name: "Science Fiction", color: "bg-blue-100", textColor: "text-blue-600" },
        { name: "Mystery", color: "bg-gray-100", textColor: "text-gray-600" },
        { name: "Thriller", color: "bg-red-100", textColor: "text-red-600" },
        { name: "Romance", color: "bg-pink-100", textColor: "text-pink-600" },
        { name: "Horror", color: "bg-indigo-100", textColor: "text-indigo-600" },
        { name: "Historical Fiction", color: "bg-yellow-100", textColor: "text-yellow-600" },
        { name: "Non-fiction", color: "bg-green-100", textColor: "text-green-600" },
        { name: "Biography", color: "bg-teal-100", textColor: "text-teal-600" },
        { name: "Self-help", color: "bg-orange-100", textColor: "text-orange-600" },
        { name: "Graphic Novel", color: "bg-cyan-100", textColor: "text-cyan-600" },
        { name: "Young Adult", color: "bg-rose-100", textColor: "text-rose-600" },
        { name: "Children's Literature", color: "bg-lime-100", textColor: "text-lime-600" },
        { name: "Dystopian", color: "bg-amber-100", textColor: "text-amber-600" },
        { name: "Adventure", color: "bg-sky-100", textColor: "text-sky-600" },
        { name: "Classics", color: "bg-emerald-100", textColor: "text-emerald-600" },
        { name: "Poetry", color: "bg-fuchsia-100", textColor: "text-fuchsia-600" },
        { name: "Crime", color: "bg-slate-100", textColor: "text-slate-600" },
        { name: "Memoir", color: "bg-violet-100", textColor: "text-violet-600" },
        { name: "Philosophy", color: "bg-stone-100", textColor: "text-stone-600" }
    ];


    const genresRef = useRef(null);

    const scrollBackward = () => {
        genresRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollForward = () => {
        genresRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };

    return (
        <>
            <div className='flex gap-2 overflow-visible' >
                {/* <button className='bg-white border border-gray-200 text-gray-800  px-2 rounded-full' >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5" onClick={scrollBackward} >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button> */}
                <div
                    ref={genresRef}
                    // className="flex gap-4 overflow-x-hidden no-scrollbar"
                    className='flex gap-4 flex-wrap'
                >
                    {
                        genres.map((e) => {
                            return (
                                <button className={`bg-gray-100  text-gray-600 border  flex gap-2 items-center  p-2 font-bold text-nowrap rounded-full my-0.5`} ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                                </svg>
                                    {e.name} </button>
                            )
                        })
                    }
                </div>
                {/* <button
                    className="bg-white border border-gray-200 text-gray-800  px-2 rounded-full"
                    onClick={scrollForward}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5L15.75 12 8.25 4.5" />
                    </svg>
                </button> */}
            </div >
        </>
    )
}

export default Genres