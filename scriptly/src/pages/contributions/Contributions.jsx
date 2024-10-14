import React from 'react'
import Filters from '../../components/Filters'
import Search from '../../components/Search'

const Contributions = () => {
    return (
        <div className='flex container m-auto flex-col gap-4' >
            <div className='flex justify-between' >
                <h3 className=' font-sans text-4xl font-bold text-gray-800 ' >
                    Contributions
                </h3>
                <div className='flex gap-3'>
                    <Search />
                    <Filters />
                </div>
            </div>
            {
                Array(5).fill(0).map(() => {
                    return <span className='flex justify-between bg-white  gap-2 p-2 rounded-lg' >
                        <div className='flex gap-2 items-center' >
                            <div className='flex flex-col gap-3'>
                                <div className='flex gap-2' >
                                    <img className="w-16 h-16 rounded-md" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />
                                    <div className='flex flex-col justify-between'>
                                        <p className='font-semibold text-lg text-gray-800' >John Doe</p>
                                        {/* <p className='text-gray-800 flex items-center gap-1'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg> 22:30 - 19/11/2024
                                        </p> */}
                                        <div className='flex gap-3'  >

                                            <p className='text-sm font-medium bg-red-100 text-red-800 justify-end rounded-md p-0.5 px-2 flex gap-1 items-center' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                                0 Pending Requests </p>
                                            <p className='text-sm font-medium bg-green-100 text-greeen-800 justify-end rounded-md p-0.5 px-2 flex gap-1 items-center' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>

                                                0 Accepted Requests </p>
                                        </div>
                                    </div>
                                </div>
                                <hr className='w-full' />
                                <div className='flex gap-2 w-full py-2' >
                                    <p className='text-lg text-gray-600' >See Contribution </p>
                                    {/* <p className='text-sm font-medium bg-blue-100 text-blue-800 justify-end rounded-md p-0.5 px-2 flex gap-1 items-center' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                        Added 64 New Lines </p> */}
                                </div>
                                {/* <p className='text-1xl' >Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eius ullam enim natus magni, fuga perferendis minima consequatur libero eos provident maiores. Repellendus, vero. Tempora beatae nulla delectus excepturi blanditiis tempore aut at doloremque asperiores aspernatur quisquam quos perferendis debitis, quis dicta maxime numquam eos harum impedit ut rerum alias quas incidunt. Esse cupiditate id numquam nostrum! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio, voluptatum a. Iure minima dignissimos aperiam quasi nobis aspernatur nostrum illo, reiciendis eum natus doloribus incidunt veniam ut quae ab. Dolore repellat qui id eaque ipsa ad hic perferendis numquam, eum facilis veniam molestias fugit nam voluptatem. Ullam animi minima, debitis cum nesciunt tempora iure dolor porro.</p> */}
                            </div>
                        </div>
                    </span>
                })
            }
        </div>
    )
}

export default Contributions