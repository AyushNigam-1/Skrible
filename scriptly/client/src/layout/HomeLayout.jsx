import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
const HomeLayout = ({ children }) => {

    return (
        <>
            {/* <div className='bg-gray-100 min-h-[100vh] font-mono'>
                
                <div className='m-4' >
                    <div className='container mx-auto' >
                        <Outlet />
                    </div>
                </div>
            </div> */}
            <div className='grid grid-cols-6 gap-4 h-screen p-2 font-mulish bg-gray-100/50' >
                <Sidebar />
                <div className='col-span-5'>
                    {/* <Navbar /> */}
                    <Outlet />
                </div>
            </div>
        </>

    )
}

export default HomeLayout