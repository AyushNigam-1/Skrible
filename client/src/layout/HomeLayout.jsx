import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const HomeLayout = () => {
    const user = localStorage.getItem("user")
    const location = useLocation();

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const path = pathSegments[0];

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 bg-[url('46-starry-night-soft-gradient.jpg')]"
            />
            <div className="absolute inset-0 z-0 bg-white/70 dark:bg-gray-900/60" />
            <div className={`relative z-10 h-full backdrop-blur-xl overflow-y-auto ${(path == 'zen' ? '' : user ? 'grid grid-cols-6' : '')}`}>

                {(path != 'zen' && user) && <Sidebar />}

                <div className={`p-4 ${path == 'zen' ? 'container mx-auto w-full' : user ? "col-span-5 " : ' flex flex-col gap-3'}`}>
                    {(path != 'zen' && !user) && <Navbar />}
                    <Outlet context={{ path }} />
                </div>

            </div>

        </div>
    )
}

export default HomeLayout