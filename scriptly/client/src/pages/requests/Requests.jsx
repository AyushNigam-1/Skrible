import React from 'react';
import RequestsSidebar from '../../components/RequestsSidebar';
import useElementHeight from '../../hooks/useElementOffset';
import { Link, useOutletContext } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import useAutoScroll from '../../hooks/useAutoScroll';

const Requests = () => {

    const { request, setRequest, data, refetch, setTab } = useOutletContext();
    const containerRef = useAutoScroll([data.getScriptById.paragraphs])
    const height = useElementHeight('requests');
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="h-full" id='requests' style={{ height }}>
            {
                data.getScriptById.requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 gap-3 h-full" >
                        <img src="/no-request.png" className="w-60 mb-4" alt="No Requests" />
                        <p className="text-4xl font-bold">No requests yet</p>
                        <p className="text-gray-400">Start a request and get contributions!</p>
                        {
                            user?.username === data.getScriptById.author.username ? (
                                <button className="mt-4 px-4 py-2 bg-white text-gray-600 rounded-lg shadow-md flex gap-2 items-center font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                    </svg>
                                    Invite Contributors
                                </button>
                            ) : (
                                <button className="mt-4 px-4 py-2 bg-white text-gray-600 rounded-lg shadow-md flex gap-2 items-center font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Create Request
                                </button>
                            )
                        }
                    </div>
                ) : (
                    <div className='grid grid-cols-12 gap-3 h-full' >
                        <RequestsSidebar requests={data.getScriptById.requests} setRequest={setRequest} request={request} scriptId={data.getScriptById._id} refetch={refetch} setTab={setTab} />
                        <div id='requestPreview' ref={containerRef}
                            className='col-span-9 flex flex-col gap-3 bg-gray-200/50 p-2 rounded-xl overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full' style={{ height }} >
                            <div className='rounded-lg  p-2 bg-white '>
                                <p className='text-xl' >

                                    {data.getScriptById.paragraphs.map((para, index) => (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>
                                            }}
                                        >
                                            {para.text}
                                        </ReactMarkdown>

                                    ))}
                                </p>
                            </div>
                            {request && (
                                <Link className='flex flex-col p-2 gap-2 bg-white rounded-lg border-indigo-300 border-2' to={`/para/${request._id}`} state={{ contribution: request }}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>
                                        }}
                                    >
                                        {request?.text}
                                    </ReactMarkdown>
                                </Link>
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Requests;
