import React from 'react'

const RequestsSidebar = ({ requests }) => {
    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        }) + ` , ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    return (
        <div className='col-span-3 bg-gray-200/50 p-2 rounded-lg' >

            {requests.map(request => {
                return <button className='bg-white rounded-lg p-2 flex gap-2 w-full' >                                               <img className="w-12 rounded-md" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />
                    <div className='flex flex-col gap-1' >
                        <h6 className='font-bold text-gray-800 text-lg text-start' >
                            {request.author.username}
                        </h6>
                        <p className='text-sm text-gray-600' >
                            {formatFancyDate(request.createdAt)}
                        </p>
                    </div>
                </button>
            })}
        </div>
    )
}

export default RequestsSidebar