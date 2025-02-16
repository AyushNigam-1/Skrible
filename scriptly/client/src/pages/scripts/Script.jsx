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
    console.log(data)
    if (loading) return <Loader height="70vh" />
    if (error) return <p>{JSON.stringify(error)}</p>

    return (
        <div className={`flex flex-col gap-6 sticky ${cursorClass}`}>
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