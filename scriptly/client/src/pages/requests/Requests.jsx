import React, { useState } from 'react'
import Search from '../../components/Search'
import Filters from '../../components/Filters'
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import RequestsSidebar from '../../components/RequestsSidebar';

const Requests = ({ data, setRequest, request, refetch, setTab }) => {
    const user = JSON.parse(localStorage.getItem('user'))
    console.log(data.getScriptById, request, user)


    return (
        <div className="h-full grid grid-rows-[1fr]">
            {
                data.getScriptById.requests.length === 0 ? <div className="flex flex-col items-center justify-center text-gray-500 gap-3 h-[600px]">
                    <img src="/no-request.png" class="w-60 mb-4" alt="No Requests" />
                    <p class="text-4xl font-bold">No requests yet</p>
                    <p class=" text-gray-400">Start a request and get contributions!</p>
                    {
                        user?.username == data.getScriptById.author.username ? <button class="mt-4 px-4 py-2 bg-white text-gray-600 rounded-lg shadow-md flex gap-2 items-center font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
                            Invite Contributors
                        </button> : <button class="mt-4 px-4 py-2 bg-white text-gray-600 rounded-lg shadow-md flex gap-2 items-center font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Request
                        </button>
                    }

                </div>
                    : <div className='grid grid-cols-12 gap-4 h-full' >
                        <RequestsSidebar requests={data.getScriptById.requests} setRequest={setRequest} request={request} scriptId={data.getScriptById.id} refetch={refetch} setTab={setTab} />
                        <div className='col-span-9  rounded-lg  flex flex-col gap-3 overflow-auto' >
                            {data.getScriptById.paragraphs.map((para, index) => {
                                return <div className='bg-white rounded-lg p-2 text-xl' key={index} > {para.text}</div>
                            })}
                            {request && <div className='flex flex-col p-2 gap-1 bg-gray-200/50 rounded-lg border-indigo-300 border-2'  >
                                <div className="flex justify-between rounded-full items-center">
                                    <div className='flex gap-2 '>
                                        <img className="rounded-full w-10" src="https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg" alt="Bonnie image" />
                                        <p className='text-lg text-gray-600' >
                                            {request?.author.username}
                                        </p>
                                    </div>
                                </div>
                                <div className='word-spacing-1 flex flex-col relative gap-1  bg-white rounded-lg p-4'>
                                    <p className='text-xl font-mulish'>
                                        {request?.text}
                                    </p>
                                </div>

                            </div>}
                        </div>
                    </div>
            }

        </div>
    )
}

export default Requests