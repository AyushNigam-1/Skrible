import { useState } from 'react'
import { useQuery } from '@apollo/client'
import Genres from '../../components/Genres'
import Search from '../../components/Search'
import Scripts from '../../components/Scripts'
import { GET_SCRIPTS_BY_GENRES } from '../../graphql/query/scriptQueries'
import Loader from '../../components/Loader'
import Add from '../add/Add'

const Explore = () => {
    const [genres, setGenres] = useState([]);
    const [search, setSearch] = useState()
    const [open, setOpen] = useState(false)
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
                        <Search setSearch={setSearch} />
                        {/* <Filters /> */}
                        <button onClick={() => setOpen(true)}> Create </button>
                    </div>
                </div>
                <Genres selectedGenres={genres} onGenreChange={handleGenreChange} />
                {
                    loading ? <Loader /> :
                        <Scripts data={data} search={search} />
                }
                <Add open={open} setOpen={setOpen} />
            </div>
        </>
    )
}

export default Explore