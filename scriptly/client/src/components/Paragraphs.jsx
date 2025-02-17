import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import Loader from './Loader';

const Paragraphs = ({ data, loading }) => {

    const [pinnedCard, setPinnedCard] = useState(null);
    const [showTextarea, setShowTextarea] = useState(false);
    const [newContribution, setNewContribution] = useState("");
    const contributionEndRef = useRef(null);
    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        }) + ` , ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
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
    const handleCardClick = (index) => {
        setPinnedCard(index); // Mark the card as pinned
        setCursorClass('cursor-default'); // Reset cursor to default
    };

    const handleAddContribution = () => {
        if (newContribution.trim()) {
            contributions.push();
            setNewContribution("");
            setShowTextarea(!showTextarea);
        }
    };
    const handleCancel = () => {
        setNewContribution("");
        setShowTextarea(false);
    };
    if (loading) return <Loader height="70vh" />

    return (
        <div className='flex flex-col gap-6' >
            <div className='flex justify-between items-center  ' >
                <div className='flex gap-3'>
                    <h3 className='font-mulish text-4xl font-black text-gray-600 ' >
                        {data?.getScriptById.title}
                    </h3>
                </div>
                <div className='flex gap-2' >
                    <button className='flex gap-2 items-center text-lg  bg-gray-200/50 text-black text-md py-4 px-6 rounded-lg' onClick={handlePinClick} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>

                        <h6>Pin</h6>
                    </button>
                    <button onClick={handleContributeClick} className='flex gap-2 items-center text-lg  bg-gray-200/50 text-black text-md py-4 px-6 rounded-lg' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h6>Contribute</h6>
                    </button>
                    <button className='flex gap-2 items-center text-lg  bg-gray-200/50 text-black text-md py-4 px-6 rounded-lg' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        <h6>Zen Mode</h6>
                    </button>
                </div>
            </div>
            <ol class={`relative ${data.getScriptById.paragraphs.length > 1 ? 'border-s-2 border-indigo-400/50 border-solid' : ''}`}>
                {
                    data?.getScriptById.paragraphs?.map((contribution, index) =>
                        <Link className='flex flex-col p-2 gap-1 h-full bg-gray-200/50 rounded-lg' to={`/para/${contribution.id}`} state={{ contribution }} >

                            <div class="flex justify-between rounded-full items-center">
                                <div className='flex gap-2 '>
                                    <img class="rounded-full w-10" src="https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg" alt="Bonnie image" />
                                    <p className='text-lg text-gray-600' >
                                        {contribution.author.username}
                                    </p>
                                </div>
                                <p className='text-lg text-gray-600' >{formatFancyDate(contribution.createdAt)}</p>
                            </div>
                            <div className='word-spacing-1 flex flex-col relative gap-1  bg-white -md rounded-lg p-4'>
                                <div className='  text-md text-gray-800' >
                                    <p className='text-xl font-mulish'>
                                        {contribution.text}
                                    </p>
                                </div>
                            </div>

                        </Link>
                    )
                }
            </ol>
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
                            onClick={handleAddContribution}
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
        // </div >
    )
}

export default Paragraphs