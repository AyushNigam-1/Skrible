import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom';
import Search from '../../components/Search';
import Filters from '../../components/Filters';

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
            <div className='flex justify-between' >
                <Search />
                <Filters />
            </div>
            <div className='grid grid-cols-6 gap-3' >
                {
                    allContributors?.map((contributor, index) => {
                        return (
                            <div className='flex items-center justify-between col-span-3 bg-gray-200/50 p-3 rounded-xl'>
                                <div className='flex gap-2'>
                                    <img className='rounded-full w-14' src='https://www.fufa.co.ug/wp-content/themes/FUFA/assets/images/profile.jpg' alt='Profile' />

                                    <div className='flex flex-col ' >
                                        <h5 className='text-gray-700 font-semibold text-xl'>
                                            {Object.keys(contributor)[0]}
                                        </h5>
                                        <p className='text-gray-500' >
                                            {(Object.values(contributor)[0]).length} Contributions
                                        </p>
                                    </div>
                                </div>
                                <span className='p-2 px-2.5 bg-white rounded-full text-xl text-gray-600 shadow-sm' >
                                    #{index + 1}
                                </span>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Contributors