import React from 'react'
import Genres from '../../components/Genres'
import Filters from '../../components/Filters'
import Search from '../../components/Search'
import Scripts from '../../components/Scripts'
import { useQuery } from '@apollo/client'
import { GET_ALL_SCRIPTS } from '../../graphql/query/scriptQueries'
import Loader from '../../components/Loader'

const Home = () => {
    const { data, loading, error } = useQuery(GET_ALL_SCRIPTS);

    if (loading) return <Loader />
    if (error) return <p>Error: {error.message}</p>;
    return (
        <>
            <div className='flex flex-col gap-6'>
                <div className='mt-2 flex justify-between'>
                    <h3 className='text-5xl font-black text-gray-700 ' >
                        Explore
                    </h3>
                    <div className='flex gap-3'>
                        <Search />
                        {/* <Filters /> */}
                    </div>
                </div>
                {/* <hr /> */}
                {/* <Genres /> */}
                {/* <hr /> */}
                <Scripts data={data} />
            </div>
        </>
    )
}

export default Home