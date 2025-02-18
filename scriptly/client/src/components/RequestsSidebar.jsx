import React from 'react'

const RequestsSidebar = ({ requests, setRequest, request }) => {
    console.log(request)
    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        }) + ` , ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    return (
        <div className='col-span-3 bg-gray-200/50 p-2 rounded-xl flex flex-col gap-3 ' >

            {requests.map(req => {
                return <button className={`bg-white rounded-lg p-2 flex justify-between items-center w-full ${request?._id == req?._id ? 'border-indigo-300 border-2' : ''}`} onClick={() => setRequest(req)} >
                    <div className='flex gap-2'>
                        <img className="w-12 rounded-md" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />
                        <div className='flex flex-col gap-1'  >
                            <h6 className='font-bold text-gray-800 text-lg text-start' >
                                {req.author.username} {request?.id === req?.id}
                            </h6>
                            <p className='text-sm text-gray-600' >
                                {formatFancyDate(req.createdAt)}
                            </p>
                        </div>
                    </div>
                    <button className='bg-gray-200/50 rounded-full p-2 text-gray-600 ' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>

                    </button>
                </button>
            })}
        </div>
    )
}

export default RequestsSidebar