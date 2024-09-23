import React from 'react'
import Genres from '../../components/Genres'

const Home = () => {
    return (
        <>
            {/* <Genres /> */}
            <div className='grid grid-cols-4 gap-6 m-4' >
                <div className='col-span-3 flex flex-col gap-6'>
                    <div className='my-4 flex justify-between'>
                        <h3 className='font-sans text-4xl font-bold text-gray-800 ' >
                            Explore
                        </h3>
                        <div class="relative">
                            <label for="Search" class="sr-only"> Search </label>
                            <input
                                type="text"
                                id="Search"
                                placeholder="Search for..."
                                class="w-72 rounded-md border-gray-200 py-2.5 pe-10  shadow-sm sm:text-sm outline-none px-3"
                            />
                            <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                <button type="button" class="text-gray-600 hover:text-gray-700">
                                    <span class="sr-only">Search ...</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="size-4"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>
                                </button>
                            </span>
                        </div>
                    </div>
                    <Genres />
                    {
                        Array(4).fill(0).map(e => {
                            return (
                                <div className=' bg-white rounded-md p-3 flex gap-3 ' >
                                    <div className='rounded-md w-max m-auto'>
                                        <img src="/noimage.png" alt="" width="100%" />
                                    </div>
                                    <div className='flex flex-col gap-4 w-full justify-evenly'>
                                        <h1 className='text-3xl font-bold' >Untitled Draft</h1>
                                        <div className='flex gap-2' >
                                            <span className='flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-0.5 rounded-full w-max' >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                                </svg>

                                                <p className='font-bold text-sm'> New </p>
                                            </span>
                                            <span className='flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full w-max' >
                                                {/* <img class="w-6 h-6 rounded-full" src="/person.jpg" alt="Rounded avatar" /> */}
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                                </svg>

                                                <p className='font-bold text-sm'> 1 Contributor  </p>
                                            </span>
                                            <div className='flex justify-between' >
                                                <span className='bg-green-100 py-1 px-3 text-green-800 rounded-full flex gap-1'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                                    </svg>
                                                    <p className='font-bold text-sm'>
                                                        Highly Active
                                                    </p>
                                                </span>
                                            </div>
                                        </div>
                                        <p className='text-lg text-gray-600 font-semibold ' > Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla fugit officia id sequi deserunt mollitia? Blanditiis aperiam fugit nihil ea voluptates dignissimos doloremque labore vitae cumque eius. Non, laborum reiciendis. Lorem, ipsum dolor sit amet consectetur adipisicing elit.eaque... </p>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>
                <div className='bg-white shadow-md col-span-1 w-full' >
                    lol
                </div>
            </div>
        </>
    )
}

export default Home