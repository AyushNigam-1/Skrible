import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom';

const Contributors = () => {
    const [allContributors, setContributors] = useState()
    const { data } = useOutletContext();

    const transformData = (contributors) => {
        const result = {};

        contributors.forEach(item => {
            const userId = item.author.username;
            if (!result[userId]) {
                result[userId] = [];
            }
            result[userId].push({
                text: item.text,
                id: item.id
            });
        });

        return Object.entries(result).map(([user, paragraphs]) => ({ [user]: paragraphs }));
    }

    useEffect(() => {
        const contributors = transformData(data.getScriptById.paragraphs)
        setContributors(contributors)
    }, [])


    return (
        <>
            {/* {
                contributors.getScriptContributors.contributors.map(contributor => {

                })
            } */}
        </>
        // <div>Contributor</div>
    )
}

export default Contributors