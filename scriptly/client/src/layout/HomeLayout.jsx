import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
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
            <div className='grid grid-cols-8 h-screen ' >
                <div className='col-span-1 flex flex-col gap-2 p-3 bg-gray-100'>
                    <img src="/logo.png" width="140px" alt="" />
                </div>
                <div className='col-span-7 p-3'>
                    {/* <Navbar /> */}
                    <Outlet />
                </div>
            </div>
        </>

    )
}

export default HomeLayout