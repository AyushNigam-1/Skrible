import React from 'react'
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import Dropdown from './Dropdown';
import { Link } from 'react-router-dom';

const Scripts = () => {

    const avatar = createAvatar(glass, {
        "seed": "Robert"
    });

    const svg = avatar.toString();

    return (
        <div className='flex gap-5 flex-col'>
            {
                Array(4).fill(0).map(e => {
                    return (
                        <Link to={`script/${e}`}>
                            <div className=' bg-white rounded-lg p-3 flex gap-4 ' >
                                <div className='flex flex-col gap-5 w-full justify-evenly'>
                                    <div className='flex gap-4'>
                                        <div className='w-20 rounded-lg overflow-hidden' dangerouslySetInnerHTML={{ __html: svg }} />
                                        <div className='flex flex-col gap-2 w-full' >
                                            <div className='flex justify-between w-full items-center'  >
                                                <h1 className='text-3xl font-bold' >Untitled Draft</h1>
                                                <Dropdown icon={<svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                    />
                                                </svg>} />
                                            </div>
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
                                        </div>
                                    </div>
                                    <p className='text-lg text-gray-600 font-semibold ' > Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla fugit officia id sequi deserunt mollitia? Blanditiis aperiam fugit nihil ea voluptates dignissimos doloremque labore vitae cumque eius. Non, laborum reiciendis. Lorem, ipsum dolor sit amet consectetur adipisicing elit.eaque Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, quis. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Porro, placeat! </p>
                                    <div className='flex justify-between items-center' >
                                        <div class='flex gap-4'>
                                            <button className='bg-green-100 text-green-800 flex items-center gap-1 p-1 px-2 rounded-md text-xl font-bold' > 0 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg></button>
                                            <button className='bg-red-100 text-red-800 flex items-center gap-1 p-1 px-2 rounded-md text-xl font-bold' > 0 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg></button>
                                        </div>
                                        <div className='flex gap-3' >
                                            {["Thriller", "Horror", "Suspense", "Fiction", "Self Help"].map(genre => <span className='bg-gray-100 text-gray-800 px-3 rounded-full py-1 text-sm font-semibold'>   # {genre}  </span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    )
}

export default Scripts