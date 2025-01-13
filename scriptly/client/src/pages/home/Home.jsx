import React from 'react'
import Genres from '../../components/Genres'
import Filters from '../../components/Filters'
import Search from '../../components/Search'
import Scripts from '../../components/Scripts'
import { useQuery, gql } from '@apollo/client'

const Home = () => {
    return (
        <>
                <div className='flex flex-col gap-6'>
                    <div className='mt-2 flex justify-between'>
                        <h3 className='font-sans text-3xl font-bold text-gray-800 ' >
                            Explore
                        </h3>
                        <div className='flex gap-3'>
                            <Search />
                            <Filters />
                        </div>
                    </div>
                    <Genres />
                    <Scripts />
            </div>
        </>
    )
}

export default Home