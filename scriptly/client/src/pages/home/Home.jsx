import React from 'react'
import Search from '../../components/Search'
import Filters from '../../components/Filters'
import { useQuery } from "@apollo/client";
import { GET_USER_SCRIPTS } from '../../graphql/query/userQueries';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import Dropdown from '../../components/Dropdown';

const Home = () => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const { data, loading, error } = useQuery(GET_USER_SCRIPTS, {
        variables: { userId },
        skip: !userId,
    });
    console.log(data)

    if (loading) return <Loader height="70vh" />
    if (error) return <div className="flex flex-col items-center justify-center text-gray-500 gap-3 h-full" >
        <img src="/no-request.png" className="w-60 mb-4" alt="No Requests" />
        <p className="text-4xl font-bold">No docs available</p>
        <p className="text-gray-400">Start creating new docs</p>
        <Link to="/add" className="mt-4 px-4 py-2 bg-white text-gray-600 rounded-lg shadow-md flex gap-2 items-center font-bold">   
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Create Docs
        </Link>
    </div>;
    const dropdownOptions = [
        {
            name: 'Interested',
            fnc: (id) => handleInterested(id),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
            )
        },
        {
            name: 'Not Interested',
            fnc: (id) => handleNotInterested(id),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
            )
        },
        {
            name: 'Mark as Favourite',
            fnc: (id) => handleMarkAsFavourite(id),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>

            )
        },
        {
            name: 'Delete',
            fnc: (id) => handleDelete(id),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>

            )
        }
    ];
    return (
        <div className='flex flex-col gap-4' >
            <div className='flex justify-between items-center'>
                <h3 className='text-4xl font-black text-gray-700 ' >
                    My Scripts
                </h3>
                <div className='flex gap-3'>
                    <Search />
                    <Filters />
                </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
                {data.getUserScripts.map((e) => <div className='bg-gray-200/50 rounded-lg p-3 flex  gap-4  h-full' >
                    <Link to={`/paragraphs/${e._id}`} className='flex flex-col gap-3 w-full justify-between'>
                        <div className='flex gap-2'>
                            {/* <div className='w-16 rounded-lg overflow-hidden' dangerouslySetInnerHTML={{ __html: svg }} /> */}
                            <div className='flex flex-col w-full' >
                                <h1 className='text-3xl font-black text-gray-700 ' >{e.title}</h1>
                                <h4 className='font-semibold text-gray-500' > ~ {e.author.username} </h4>
                                {/* <div className='flex gap-2' >
                                    <span className='flex items-center gap-1 bg-white text-gray-500 px-2  rounded-lg w-max text-sm py-0.5' >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                        </svg>
                                        <p className='font-bold text-sm'> New </p>
                                    </span>
                                    <span className='flex items-center gap-1 bg-white text-gray-500 px-2  rounded-lg w-max text-sm py-0.5' >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                        </svg>
                                        <p className='font-bold text-sm'> 1 Contributor  </p>
                                    </span>
                                    <span className='flex items-center gap-1 bg-white text-gray-500 px-2  rounded-lg w-max text-sm py-0.5'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                        </svg>
                                        <p className='font-bold text-sm'>
                                            Highly Active
                                        </p>
                                    </span>
                                </div> */}
                            </div>
                        </div>
                        <p className='text-lg text-gray-500 font-semibold ' > {e.description} </p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {e.genres.map((genre) => (
                                <span key={genre} className="flex items-center gap-1 bg-white text-gray-500 px-2  rounded-lg w-max text-sm py-0.5 font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                                    </svg> {genre}
                                </span>
                            ))}
                        </div>
                    </Link>
                    {/* {<Dropdown icon={<svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                    </svg>} options={dropdownOptions} scriptId={e.id} />} */}
                </div>
                )}</div>
        </div>
    )
}

export default Home