import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Tabs from '../../components/Tabs';
import Paragraphs from '../../components/Paragraphs';
import Contributions from '../contributions/Contributions';
import Requests from '../requests/Requests';
import ScriptDetails from '../../components/ScriptDetails';
import { GET_SCRIPT_BY_ID } from '../../graphql/query/scriptQueries';
import { useQuery } from '@apollo/client';
import Loader from '../../components/Loader';
const Script = () => {
    const { id } = useParams()
    const [cursorClass, setCursorClass] = useState('cursor-default');
    const [tab, setTab] = useState("Script")

    const { data, loading, error } = useQuery(GET_SCRIPT_BY_ID, {
        variables: { id },
        skip: !id,
    });

    if (loading) return <Loader height="70vh" />

    const options = [{
        name: "Add to Favourites",
        svg: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        )
    }, {
        name: "Add to Read Later",
        svg: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        )
    }, {
        name: 'Not Interested',
        svg: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
            </svg>
        )
    }]

    return (
        <div className={`flex flex-col gap-6 sticky ${cursorClass} container mx-auto`}>
            <Tabs tab={tab} setTab={setTab} scripts={data.getScriptById} />
            <div>
                {
                    tab == "Script" ? <Paragraphs data={data} loading={loading} /> : tab == "Requests" ? <Requests data={data} /> : tab == "Contributions" ? <Contributions data={data} /> : <ScriptDetails data={data} />
                }

            </div>
        </div>
    )
}

export default Script