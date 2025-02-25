import React, { useEffect, useState } from "react";
import { useParams, Outlet, useOutletContext } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_SCRIPT_BY_ID } from "../graphql/query/scriptQueries";
import Tabs from "../components/Tabs";
import Loader from "../components/Loader";

const ScriptLayout = () => {
    const { id } = useParams();
    const { path } = useOutletContext()
    const [cursorClass, setCursorClass] = useState("cursor-default");
    const [request, setRequest] = useState(null);
    const [tab, setTab] = useState("Script")

    const { data, loading, error, refetch } = useQuery(GET_SCRIPT_BY_ID, {
        variables: { id },
        skip: !id,
    });

    useEffect(() => {
        if (!request && data?.getScriptById?.requests) {
            setRequest(data?.getScriptById?.requests[0]);
        }
    }, [data]);
    console.log(data)
    if (loading) return <Loader height="100vh" />;
    if (error) return <p>{JSON.stringify(error)}</p>;

    return (
        <div className={`${path == 'zen' ? 'w-full' : `flex flex-col gap-3 sticky ${cursorClass} `} `}>
            {path != 'zen' && <Tabs setTab={setTab} tab={tab} scriptId={id} />}

            <Outlet context={{ request, setRequest, data, refetch, setTab, tab, loading }} />

        </div>
    );
};

export default ScriptLayout;
