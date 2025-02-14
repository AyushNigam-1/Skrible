import React from 'react'
import Search from '../../components/Search'
import Filters from '../../components/Filters'
import { useQuery } from "@apollo/client";
import { GET_USER_SCRIPTS } from '../../graphql/query/userQueries';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';

const MyScripts = () => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const { data, loading, error } = useQuery(GET_USER_SCRIPTS, {
        variables: { userId },
        skip: !userId,
    });
    if (error) return <p>Error: {error.message}</p>;
    return (
        <div className='flex container m-auto flex-col gap-6' >
            <div className='flex justify-between' >
                <h4 className='text-2xl font-bold text-gray-800' >My Scripts</h4>
                <span className='flex gap-3'>
                    <Search />
                    <Filters />
                </span>
            </div>
            {loading ? <Loader height="70vh" /> : <div className='grid grid-cols-2 gap-5'>
                {data.getUserScripts.map((e) => <div className=' bg-white rounded-lg p-3 flex  gap-4 shadow h-full' >
                    <Link to={`/script/${e.id}`} className='flex flex-col gap-3 w-full justify-between'>
                        <div className='flex gap-2'>
                            {/* <div className='w-16 rounded-lg overflow-hidden' dangerouslySetInnerHTML={{ __html: svg }} /> */}
                            <div className='flex flex-col gap-2 w-full' >
                                <h1 className='text-xl font-bold text-gray-800 ' >{e.title}</h1>
                                <div className='flex gap-2' >
                                    <span className='flex items-center gap-1 bg-red-100/50 text-orange-800 px-3 py-0.5 rounded-full w-max' >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                        </svg>
                                        <p className='font-bold text-xs'> New </p>
                                    </span>
                                    <span className='flex items-center gap-1 bg-red-100/50 text-indigo-800 px-3 py-1 rounded-full w-max' >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                        </svg>
                                        <p className='font-bold text-xs'> 1 Contributor  </p>
                                    </span>
                                    <div className='flex justify-between' >
                                        <span className='bg-red-100/50 py-1 px-3 text-green-800 rounded-full flex gap-1'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                            </svg>
                                            <p className='font-bold text-xs'>
                                                Highly Active
                                            </p>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className='text-md text-gray-600 font-semibold ' > {e.description} </p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {e.genres.map((genre) => (
                                <span key={genre} className="bg-red-100/50 text-gray-600 px-3 rounded-full py-1 text-xs font-bold">
                                    # {genre}
                                </span>
                            ))}
                        </div>
                    </Link>

                </div>
                )}</div>}
        </div>
    )
}

export default MyScripts