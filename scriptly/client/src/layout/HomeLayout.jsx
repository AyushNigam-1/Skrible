import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
const HomeLayout = () => {
    const user = localStorage.getItem("user")
    console.log(user)
    return (
        <>
            <div className={`${user ? 'grid grid-cols-6' : ''}  gap-5 h-screen p-2 font-mulish bg-gray-100/50`} >
                {user && <Sidebar />}
                <div className={`${user ? 'col-span-5 ' : ' flex  flex-col gap-4'}  `}>
                    {!user && <Navbar />}
                    <div className={`${user ? '' : ''}  `} >
                        <Outlet />
                    </div>
                </div>
            </div>
        </>

    )
}

export default HomeLayout