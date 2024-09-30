import React from 'react'
import Genres from '../../components/Genres'
import Filters from '../../components/Filters'
import Search from '../../components/Search'
import Scripts from '../../components/Scripts'
import { useQuery, gql } from '@apollo/client'

const query = gql`
query GetTodosWithUser {
getTodos {
id
title
completed
user {
id
name
}
}
}
`

const Home = () => {
    const { data, loading } = useQuery(query)

    if (loading) return <h1>loading ...</h1>

    console.log(data)
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