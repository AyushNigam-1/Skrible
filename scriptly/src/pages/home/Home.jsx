import React from 'react'
import Navbar from '../../components/Navbar'
import HomeLayout from '../../layout/HomeLayout'

const Home = () => {
    return (
        <div className='container mx-auto' >
            <div className='my-4 bg-white rounded-md p-3 flex gap-3' >
                <div className='rounded-md w-max'>
                    <img src="/noimage.png" alt="" />
                </div>
                <div className='flex flex-col gap-4 w-full justify-evenly'>
                    <h1 className='text-3xl font-bold' >Untitled Draft</h1>
                    <div className='flex gap-2' >
                        <span className='flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full w-max' >
                            <img width="18" height="18" src="https://img.icons8.com/material-outlined/18/9a3412/sparkling.png" alt="sparkling" />
                            <p className='font-bold'> New </p>
                        </span>
                        <span className='flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full w-max' >
                            <img class="w-6 h-6 rounded-full" src="/person.jpg" alt="Rounded avatar" />
                            <p className='font-bold'> 1 Contributor  </p>
                        </span>
                    </div>
                    <p className='text-lg text-gray-600 font-semibold ' > Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla fugit officia id sequi deserunt mollitia? Blanditiis aperiam fugit nihil ea voluptates dignissimos doloremque labore vitae cumque eius. Non, laborum reiciendis. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Libero porro sequi, maxime consectetur voluptatem quasi eum ab nihil molestias dignissimos aspernatur rerum, reiciendis labore quo, amet hic iusto ex eaque... </p>
                    <div className='flex justify-between' >
                        <p className='bg-green-100 py-1 px-3 text-green-800 rounded-full flex font-bold'>
                            <img width="18" height="18" src="https://img.icons8.com/windows/18/166534/up3.png" alt="up3" /> Highly Active </p>
                        {/* <p>Updated At : 12/12/2024</p> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home