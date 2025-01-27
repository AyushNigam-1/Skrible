import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
const HomeLayout = ({ children }) => {
    return (
        <>
            <div className='bg-red-50 min-h-[100vh]'>
                <Navbar />
                <div className='m-4' >
                    <div className='container mx-auto' >
                        <Outlet />
                    </div>
                </div>
            </div>
        </>

    )
}

export default HomeLayout