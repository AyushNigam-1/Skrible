import React from 'react'
import Search from '../../components/Search'
import Filters from '../../components/Filters'
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import RequestsSidebar from '../../components/RequestsSidebar';

const Requests = ({ data }) => {
    console.log(data.getScriptById)
    const avatar = createAvatar(glass, {
        "seed": "Robert"
    });
    function formatDate(isoString) {
        const date = new Date(Number(isoString));
        return date.toLocaleString();
    }
    const svg = avatar.toString();
    return (
        <div className='flex flex-col gap-1'>
            <div className='flex justify-between' >
                {/* <Search />
                <span>
                    <Filters />
                </span> */}
            </div>
            {/* <div className='grid grid-cols-2 gap-5 rounded-lg ' >
                {
                    data.getScriptById.requests.map((request) => {
                        return (
                            <div className='flex-col flex justify-between bg-white  gap-2 p-2 rounded-lg relative' >
                                <div className='flex gap-2 items-center' >
                                    <div className='flex flex-col gap-2 '>
                                        <div className='flex gap-2 justify-between items-center'  >
                                            <div className='flex gap-2 '>
                                                <img className="w-14 h-14 rounded-md" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />
                                                <div className='flex justify-between '>
                                                    <div className='flex flex-col justify-between'>
                                                        <p className='font-semibold text-lg text-gray-800' >{request.author.username}</p>
                                                        <div className='flex gap-3'  >
                                                            <p className='text-sm bg-orange-100 text-orange-800 justify-end rounded-full p-0.5 px-2 flex gap-1 items-center font-bold' >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                                {request.status}
                                                            </p>
                                                            <p className='text-sm bg-gray-100 text-gray-800 justify-end rounded-full p-0.5 px-2 flex gap-1 items-center font-bold'>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>  {formatDate(request.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex gap-2 w-full py-2' >
                                            <p className='text-lg text-gray-600' >{request.text}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <button className='flex gap-2 border bg-white  border-gray-300 rounded-full p-2 text-green-800'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </button>
                                    <button className='flex gap-2 rounded-full  bg-white border border-gray-300 p-2 text-red-800'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button className='flex gap-2 rounded-full  bg-white border border-gray-300 p-2 text-indigo-800'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                        </svg>

                                    </button>
                                    <button className='flex gap-2 rounded-full  bg-white border border-gray-300 p-2 text-indigo-800'>
                                        {request.comments.length}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )
                    })
                }
            </div> */}
            <div className='grid grid-cols-12 gap-2 h-full' >
                <RequestsSidebar requests={data.getScriptById.requests} />
                <div className='col-span-9 bg-gray-200/50 rounded-lg p-2' >
                    {data.getScriptById.paragraphs.map(para => {
                        return <div className='bg-white rounded-lg p-2 text-lg' > {para.text}</div>
                    })}
                    <div  >

                    </div>

                </div>
            </div>
        </div>
    )
}

export default Requests