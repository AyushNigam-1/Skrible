import React from 'react'
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import Dropdown from './Dropdown';
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_SCRIPTS } from '../graphql/query/scriptQueries';
import Loader from './Loader';
import { DELETE_SCRIPT, MARK_AS_FAVOURITE, MARK_AS_INTERESTED, MARK_AS_NOT_INTERESTED } from '../graphql/mutation/scriptMutations';
const Scripts = () => {

    const avatar = createAvatar(glass, {
        "seed": "Robert"
    });

    const [markAsInterested] = useMutation(MARK_AS_INTERESTED);
    const [markAsNotInterested] = useMutation(MARK_AS_NOT_INTERESTED);
    const [markAsFavourite] = useMutation(MARK_AS_FAVOURITE);
    const [deleteScript] = useMutation(DELETE_SCRIPT);

    const handleInterested = async (id) => {
        try {
            await markAsInterested({ variables: { scriptId: id } });
            console.log("Marked as Interested!");
        } catch (error) {
            console.error("Error marking as Interested:", error);
        }
    };

    const handleNotInterested = async (id) => {
        try {
            await markAsNotInterested({ variables: { scriptId: id } });
            console.log("Marked as Not Interested!");
        } catch (error) {
            console.error("Error marking as Not Interested:", error);
        }
    };

    const handleMarkAsFavourite = async (id) => {
        try {
            await markAsFavourite({ variables: { scriptId: id } });
            console.log("Marked as Favourite!");
        } catch (error) {
            console.error("Error marking as Favourite:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteScript({ variables: { scriptId: id } });
            console.log("Script Deleted!");
        } catch (error) {
            console.error("Error deleting script:", error);
        }
    };
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75v14.5M19.25 12H4.75" />
                </svg>
            )
        },
        {
            name: 'Mark as Favourite',
            fnc: (id) => handleMarkAsFavourite(id),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.75 17.25l6.25-9 6.25 9H5.75z" />
                </svg>
            )
        },
        {
            name: 'Delete',
            fnc: (id) => handleDelete(id),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M12 6v12M21 6H3" />
                </svg>
            )
        }
    ];
    const { data, loading, error } = useQuery(GET_ALL_SCRIPTS);

    if (loading) return <Loader height="70vh" />
    if (error) return <p>Error: {error.message}</p>;
    const svg = avatar.toString();

    return (
        <div className='grid grid-cols-2 gap-5'>
            {
                data?.getAllScripts?.map(e => {
                    return (
                        <div className=' bg-white rounded-lg p-3 flex gap-4 shadow h-full' >
                            <div className='flex flex-col gap-3 w-full '>
                                <div className='flex gap-2'>
                                    <div className='w-16 rounded-lg overflow-hidden' dangerouslySetInnerHTML={{ __html: svg }} />
                                    <div className='flex flex-col gap-2 w-full' >
                                        <div className='flex justify-between w-full'  >
                                            <h1 className='text-xl font-bold text-gray-800 ' >{e.title}</h1>
                                            <Dropdown icon={<svg
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
                                            </svg>} options={dropdownOptions} scriptId={e.id} />
                                        </div>
                                        <div className='flex gap-2' >
                                            <span className='flex items-center gap-1 bg-red-100/50 text-orange-800 px-3 py-0.5 rounded-full w-max' >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                                </svg>
                                                <p className='font-bold text-xs'> New </p>
                                            </span>
                                            <span className='flex items-center gap-1 bg-red-100/50 text-indigo-800 px-3 py-1 rounded-full w-max' >
                                                {/* <img class="w-6 h-6 rounded-full" src="/person.jpg" alt="Rounded avatar" /> */}
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
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Scripts