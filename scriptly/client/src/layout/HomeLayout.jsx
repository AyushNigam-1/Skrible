import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
const HomeLayout = () => {
    const user = localStorage.getItem("user")
    const location = useLocation();

    const pathSegments = location.pathname.split("/").filter(Boolean);

    const path = pathSegments[0];
    console.log(path)
    return (
        <>
            <div className={`${(path == 'zen' ? '' : user ? 'grid grid-cols-6 gap-3' : '')}  h-screen p-3 font-mulish bg-gray-100/50`} >
                {(path != 'zen' && user) && <Sidebar />}
                <div className={`${path == 'zen' ? 'container mx-auto w-full' : user ? "col-span-5 " : ' flex flex-col gap-3'}   `}>
                    {(path != 'zen' && !user) && <Navbar />}
                    <Outlet context={{ path }} />
                </div>
            </div>
        </>

    )
}

export default HomeLayout