import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const ZenMode = () => {
    const navigate = useNavigate();

    const { data } = useOutletContext();
    const [cursorClass, setCursorClass] = useState('cursor-default');

    const handlePinClick = () => {
        setCursorClass('cursor-pin');
    };
    return (
        <div className='flex flex-col gap-5 w-full' >
            <div className='flex justify-between items-center' >
                <button className='bg-gray-200/50 p-4 rounded-full w-min' onClick={() => navigate(-1)} ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
                </button>
                <h4 className="text-gray-700 font-bold text-3xl" >{data.getScriptById.author.username}</h4>
                <button className='flex gap-2 items-center text-lg  bg-gray-200/50 text-black text-md p-4 rounded-full' onClick={handlePinClick} >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>

                    {/* <h6>Pin</h6> */}
                </button>
            </div>
            <div className='flex flex-col gap-2 bg-gray-200/50 p-2 rounded-xl text-xl h-full text-gray-800 h-full' >

                {data.getScriptById.paragraphs.map((para, index) => (
                    <p>{para.text}</p>
                ))}
            </div>
        </div>
    )
}

export default ZenMode