import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import Loader from './Loader';

const Paragraphs = ({ data, loading }) => {

    const [pinnedCard, setPinnedCard] = useState(null);
    const [showTextarea, setShowTextarea] = useState(false);
    const [newContribution, setNewContribution] = useState("");
    const contributionEndRef = useRef < HTMLDivElement | null > (null);


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

    // const handleAddContribution = () => {
    //     if (newContribution.trim()) {
    //         contributions.push();
    //         setNewContribution("");
    //         setShowTextarea(false);
    //     }
    // };
    const handleCancel = () => {
        setNewContribution("");
        setShowTextarea(false);
    };
    if (loading) return <Loader height="70vh" />

    return (
        <div className='flex flex-col gap-6' >
            <div className='flex justify-between top-2 ' >
                <div className='flex gap-3'>
                    <h3 className='font-sans text-3xl font-bold text-gray-800 ' >
                        {data?.getScriptById.title}
                    </h3>
                </div>
                <div className='flex gap-2' >
                    <button className='flex gap-2 items-center text-sm shadow bg-indigo-400 text-white text-md px-3 py-2 rounded-md' onClick={handlePinClick} >
                        <img src="/pin.png" alt="" width="20px" />
                        <h6>Pin</h6>
                    </button>
                    <button onClick={handleContributeClick} className='flex gap-2 text-sm items-center bg-indigo-400 text-white shadow text-md px-3 py-2 rounded-md' >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h6>Contribute</h6>
                    </button>
                    <button className='flex gap-2 items-center shadow text-sm bg-indigo-400 text-white text-md  px-3 py-2  rounded-md' >
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
                        <Link className='flex gap-1 h-full' to={`/para/${contribution.id}`} state={{ contribution }} >
                            <li class="mb-6 ms-8 h-full">
                                <span class="absolute flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full -start-[22px] py-2  dark:bg-gray-500/50 dark:bg-blue-900">
                                    <img class="rounded-full ring-red-50 ring-8" src="https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg" alt="Bonnie image" />
                                </span>
                                <div className='word-spacing-1 flex flex-col relative gap-1 bg-white shadow-md rounded-lg p-4'>
                                    <div className='  text-md text-gray-800' >
                                        <p className=''>
                                            {contribution.text}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </Link>
                    )
                }
            </ol>
            {/* <div
                className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-4  ${showTextarea ? "opacity-100 " : "opacity-0 "
                    }`}>
                <textarea
                    rows={6}
                    value={newContribution}
                    onChange={(e) => setNewContribution(e.target.value)}
                    className="w-full shadow-md border-none rounded-lg p-4 outline-none resize-none"
                    placeholder="Add your contribution..."
                />
                <div className='flex gap-3' >
                    <button
                        onClick={handleAddContribution}
                        className="px-8 py-2 flex justify-center gap-1 bg-indigo-400 text-gray-200 font-semibold rounded"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>

                        Submit
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-8 py-2 bg-gray-300 flex justify-center gap-1 font-semibold text-gray-800 rounded"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>

                        Cancel
                    </button >
                </div>
            </div> */}
            {/* Reference to scroll to the end */}
            {/* <div ref={contributionEndRef} ></div> */}
            {/* </div> */}
        </div >
    )
}

export default Paragraphs