import React, { useEffect, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom';
import Loader from './Loader';
import { CREATE_REQUEST } from '../graphql/mutation/scriptMutations';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { EXPORT_DOCUMENT_QUERY } from '../graphql/query/paragraphQueries';

const Paragraphs = () => {
    const { setRequest, data, refetch, setTab, loading } = useOutletContext();
    const [isDownloading, setLoading] = useState(false)
    const [fetchDocument] = useLazyQuery(EXPORT_DOCUMENT_QUERY);

    const handleDownload = async (format) => {
        setLoading(true)
        const response = await fetchDocument({
            variables: { scriptId: data?.getScriptById._id, format }
        });
        console.log(response)
        downloadFile(response.data.exportDocument.filename, response.data.exportDocument.content, response.data.exportDocument.contentType);

    };

    function downloadFile(filename, content, contentType) {

        let blob;
        let url;

        if (contentType === "application/pdf") {
            try {
                if (!/^[A-Za-z0-9+/=]+$/.test(content)) {
                    throw new Error("Invalid Base64 characters detected");
                }

                // Decode Base64
                const byteCharacters = atob(content.trim());
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: contentType });
                url = URL.createObjectURL(blob);
            } catch (error) {
                console.error("Base64 decoding error:", error);
                return;
            }
        } else {
            blob = new Blob([content], { type: contentType });
            url = URL.createObjectURL(blob);
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (blob) {
            URL.revokeObjectURL(url);
        }
        setLoading(false)
    }



    const [pinnedCard, setPinnedCard] = useState(null);
    const [showTextarea, setShowTextarea] = useState(false);
    const [newContribution, setNewContribution] = useState("");
    const contributionEndRef = useRef(null);

    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return `${date.getHours()}:${String(date.getSeconds()).padStart(2, "0")}`;
    }

    useEffect(() => {
        if (showTextarea && contributionEndRef.current) {
            contributionEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showTextarea]);

    const handleContributeClick = () => {
        setShowTextarea(true);
    };

    const handlePinClick = () => {
        setCursorClass('cursor-pin'); // Change to pin cursor on click
    };
    // const handleCardClick = (index) => {
    //     setPinnedCard(index); // Mark the card as pinned
    //     setCursorClass('cursor-default'); // Reset cursor to default
    // };
    const [createRequest, { error }] = useMutation(CREATE_REQUEST, {
        onCompleted: (data) => {
            console.log("Request created:", data.createRequest);
        },
        onError: (error) => {
            console.error("Error creating request:", error.message);
        },
    });

    const handleCreateRequest = async () => {
        if (!newContribution.trim()) return alert("Request text cannot be empty!");
        try {
            const request = await createRequest({ variables: { scriptId: data?.getScriptById._id, text: newContribution } });
            setNewContribution("");
            setTab("Requests")
            refetch()
            // console.log(request)
            setRequest(request.data.createRequest)
        } catch (err) {
            console.error("Mutation failed:", err);
        }
    };

    const handleCancel = () => {
        setNewContribution("");
        setShowTextarea(false);
    };

    if (loading) return <Loader />

    // Create a single date formatter instance.
    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    // Clone and sort paragraphs to avoid mutating original data.
    const paragraphs = [...(data?.getScriptById.paragraphs || [])]
        .filter(p => !isNaN(Number(p.createdAt))) // Remove invalid timestamps
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    // Group paragraphs by formatted date.
    const groupedParagraphs = paragraphs.reduce((groups, paragraph) => {
        const date = formatter.format(new Date(Number(paragraph.createdAt)));
        (groups[date] ||= []).push(paragraph);
        return groups;
    }, {});

    // Sort the date keys (most recent dates first).
    const sortedDates = Object.keys(groupedParagraphs)
        .map(date => ({ date, timestamp: new Date(date).getTime() })) // Convert to timestamp
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp
        .map(item => item.date); // Extract sorted date strings



    return (
        <div className='flex flex-col gap-3' >
            <div className='flex justify-between items-center  ' >
                <div className='flex gap-3'>
                    <h3 className='font-mulish text-4xl font-black text-gray-600 ' >
                        {data?.getScriptById.title}
                    </h3>
                </div>
                <div className='flex gap-2' >
                    {/* <button className='flex gap-2 items-center text-lg  bg-gray-200/50 text-black text-md py-4 px-6 rounded-lg' onClick={handlePinClick} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>

                        <h6>Pin</h6>
                    </button> */}
                    <Popover className="relative">
                        <PopoverButton className="flex gap-2 items-center text-lg outline-none bg-gray-200/50 text-gray-600 text-md py-4 px-6 rounded-lg"> {isDownloading ? <svg aria-hidden="true" className="w-6 h-6 text-gray-400 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>}
                            Export</PopoverButton>
                        <PopoverPanel anchor="bottom" className="flex flex-col gap-2 bg-gray-200/50 text-gray-600 mt-2 w-44 text-xl p-2 rounded-lg border-gray-300 border">
                            <button onClick={() => handleDownload("txt")} className='flex gap-2 items-center hover:bg-white p-1 rounded-lg' ><img width="24" height="24" src="https://img.icons8.com/forma-light/24/737373/txt.png" alt="txt" /> .txt</button>
                            <button onClick={() => handleDownload("pdf")} className='flex gap-2 items-center hover:bg-white p-1 rounded-lg'> <img width="27" height="27" src="https://img.icons8.com/small/27/737373/pdf-2.png" alt="pdf-2" /> .pdf</button>
                        </PopoverPanel>
                    </Popover>
                    <button onClick={handleContributeClick} className='flex gap-2 items-center text-lg  bg-gray-200/50 text-gray-600 text-md py-4 px-6 rounded-lg' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h6>Contribute</h6>
                    </button>
                </div>
            </div>
            <div className='flex flex-col gap-4' >
                {sortedDates.map(date => (
                    <div key={date} className='flex flex-col gap-4' >
                        <h4 className='text-md text-gray-500 text-center'>{date}</h4>
                        {groupedParagraphs[date].map((contribution, index) => (
                            <Link key={index} className='flex flex-col p-2 gap-2 bg-gray-200/50 rounded-lg' to={`/para/${contribution.id}`} state={{ contribution }}>
                                <div className='flex gap-2 justify-between items-center'>
                                    <div className='flex gap-2 items-center' >
                                        <img className='rounded-full w-6' src='https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg' alt='Profile' />
                                        <p className='font-semibold text-lg text-gray-600'>{contribution.author.username}</p>
                                    </div>
                                    <p className='text-sm text-gray-600'>{formatFancyDate(contribution.createdAt)}</p>
                                </div>
                                <div className='text-md text-gray-800 bg-white p-3 rounded-lg'>
                                    <p className='text-xl font-mulish'>{contribution.text}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}

                <div className={`flex flex-col p-2 gap-1 h-full bg-gray-200/50 rounded-lg ${showTextarea ? "opacity-100 " : "opacity-0 "
                    } `}>
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-2  $`}>
                        <textarea
                            rows={6}
                            value={newContribution}
                            onChange={(e) => setNewContribution(e.target.value)}
                            className="w-full -md border-none rounded-lg p-4 outline-none resize-none"
                            placeholder="Add your contribution..."
                        />
                        <div className='flex gap-2' >
                            <button
                                onClick={handleCreateRequest}
                                className="px-8 py-2 bg-white flex justify-center gap-1 font-semibold text-gray-600 rounded"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>

                                Submit
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-8 py-2 bg-white flex justify-center gap-1 font-semibold text-gray-600 rounded"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>

                                Cancel
                            </button >
                        </div>
                    </div>

                </div>
                {/* Reference to scroll to the end */}
                <div ref={contributionEndRef} ></div>
            </div>
        </div >
    )
}

export default Paragraphs