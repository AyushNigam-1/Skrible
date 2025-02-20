import React, { useEffect, useState } from 'react'
import { ACCEPT_REQUEST } from '../graphql/mutation/scriptMutations';
import { useMutation } from '@apollo/client';

const RequestsSidebar = ({ requests, setRequest, request, scriptId, refetch, setTab }) => {
    const [height, setHeight] = useState("auto");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequests, setFilteredRequests] = useState(requests);
    const [acceptRequest, { loading, error }] = useMutation(ACCEPT_REQUEST);

    const handleAcceptRequest = async (requestId) => {
        // console.log("Request accepted:", scriptId, requestId);
        try {
            const { data } = await acceptRequest({
                variables: { scriptId, requestId },
            });
            refetch()
            setTab("Script")
            console.log("Request accepted successfully:", data);
            return data.acceptRequest;
        } catch (err) {
            console.error("Error accepting request:", err);
            return null;
        }
    };

    useEffect(() => {
        const updateHeight = () => {
            const element = document.getElementById("requests-sidebar");
            if (element) {
                const distanceFromTop = element.getBoundingClientRect().top + window.scrollY;
                setHeight(`${window.innerHeight - distanceFromTop - 14}px`);
                console.log(`${window.innerHeight - distanceFromTop}px`)
            }
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    useEffect(() => {
        setFilteredRequests(
            requests.filter(req =>
                req.author.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, requests]);

    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        }) + ` , ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    return (
        <div className='col-span-3 bg-gray-200/50 p-2 rounded-xl flex flex-col gap-3  ' >
            <div className="flex gap-2 text-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-indigo-300 p-2 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10A7 7 0 1 1 3 10a7 7 0 0 1 14 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by author..."
                    className="text-lg bg-transparent rounded-lg w-full focus:outline-none "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div id='requests-sidebar' className='flex flex-col gap-3 overflow-auto scrollbar-none' style={{ height }} >
                {filteredRequests.length ? filteredRequests.map((req, index) => {
                    return <div key={index} className={`bg-white rounded-lg p-2 flex justify-between items-center w-full cursor-pointer ${request?._id == req?._id ? 'border-indigo-300 border-2' : ''}`} onClick={() => setRequest(req)}  >
                        <div className='flex gap-2'>
                            <img className="w-12 rounded-md" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />
                            <div className='flex flex-col gap-1'  >
                                <h6 className='font-bold text-gray-800 text-lg text-start' >
                                    {req.author.username} {request?._id === req?._id}
                                </h6>
                                <p className='text-sm text-gray-600' >
                                    {formatFancyDate(req.createdAt)}
                                </p>
                            </div>
                        </div>
                        <button className='bg-gray-200/50 rounded-full p-2 text-gray-600 ' onClick={() => {
                            handleAcceptRequest(req._id)
                        }} >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>
                }) : <h6 className='text-center text-gray-600 font-semibold text-lg' >No requests available</h6>}
            </div>

        </div>
    )
}

export default RequestsSidebar