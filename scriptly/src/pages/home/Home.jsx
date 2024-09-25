import React from 'react'
import Genres from '../../components/Genres'
import Filters from '../../components/Filters'
import Search from '../../components/Search'
import Scripts from '../../components/Scripts'

const Home = () => {
    return (
        <>
            <div className='container mx-auto gap-6 m-4' >
                <div className='flex flex-col gap-6'>
                    <div className='my-4 flex justify-between'>
                        <h3 className='font-sans text-4xl font-bold text-gray-800 ' >
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
            </div>
        </>
    )
}

export default Home