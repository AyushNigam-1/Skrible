import React, { useState } from 'react'
import Genres from '../../components/Genres'
import Filters from '../../components/Filters'
import Search from '../../components/Search'
import Scripts from '../../components/Scripts'
import { useQuery } from '@apollo/client'
import { GET_SCRIPTS_BY_GENRES } from '../../graphql/query/scriptQueries'
import Loader from '../../components/Loader'

const Home = () => {
    const [genres, setGenres] = useState([]);

    const { data, loading, error, refetch } = useQuery(GET_SCRIPTS_BY_GENRES, {
        variables: { genres }
    });

    const handleGenreChange = (newGenres) => {
        setGenres(newGenres);
        refetch({ genres: newGenres });
    };

    if (error) return <p>Error: {error.message}</p>;
    return (
        <>
            <div className='flex flex-col gap-5'>
                <div className='mt-2 flex justify-between'>
                    <h3 className='text-5xl font-black text-gray-700 ' >
                        Explore
                    </h3>
                    <div className='flex gap-3'>
                        <Search />
                        {/* <Filters /> */}
                    </div>
                </div>
                <Genres selectedGenres={genres} onGenreChange={handleGenreChange} />
                {
                    loading ? <Loader /> :
                        <Scripts data={data} />
                }
            </div>
        </>
    )
}

export default Home