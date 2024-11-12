import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
const HomeLayout = ({ children }) => {
    return (
        <>
            <div className='bg-red-100/50 min-h-[100vh]'>
                <Navbar />
                <div className='m-4' >
                    <Outlet />
                </div>
            </div>
        </>

    )
}

export default HomeLayout