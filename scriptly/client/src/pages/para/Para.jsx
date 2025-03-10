import React from 'react'
import { useLocation } from 'react-router-dom'
import useElementHeight from '../../hooks/useElementOffset';

const Para = () => {
    const commentsHeight = useElementHeight('comments');

    function formatFancyDate(timestamp) {
        const date = new Date(Number(timestamp));
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        }) + ` , ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    }

    const location = useLocation();
    const { contribution } = location.state || {};

    return (
        <div className='flex flex-col gap-3' >
            <div className='bg-gray-200/50 p-2 rounded-lg flex flex-col gap-2' >
                <div className='flex gap-2' >
                    <img className="rounded-full w-12" src="https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg" alt="Bonnie image" />
                    <div className=''>
                        <p className='font-semibold text-lg text-gray-800' >{contribution.author.username}</p>
                        <p className='text-sm text-gray-600'>
                            {formatFancyDate(contribution.createdAt)}
                        </p>
                    </div>
                </div>
                <div className='word-spacing-1 flex flex-col relative gap-1 bg-white rounded-lg p-3 h-36'>
                    <div className='  text-md text-gray-800' >
                        <p className='text-xl font-mulish'>
                            {contribution.text}
                        </p>
                    </div>
                </div>
            </div>
            <div className='flex-col flex ' >
                <h5 className='text-gray-600 font-semibold text-2xl' >Comments</h5>
            </div>
            <div className='bg-gray-200/50 p-2 rounded-lg flex flex-col gap-2' id='comments' style={{ height: commentsHeight }} >
                <div className='bg-white rounded-lg h-full'   >
                    {contribution.comments.length ? "" : <div className="flex flex-col items-center justify-center rounded-lg mt-auto h-full gap-3">
                        <img
                            src="/comments.png"
                            alt="No comments"
                            className="w-60"
                        />
                        <p className="text-gray-600 mt-2 text-2xl font-semibold">No comments yet</p>
                        <p className="text-gray-400 text-sm">Be the first to start the conversation</p>
                    </div>}
                </div>
                <div className='flex gap-2' >
                    <input type="text" className='bg-white rounded-lg w-full text-xl p-3' placeholder='Write your comment' />
                </div>
            </div>
        </div>
    )
}

export default Para