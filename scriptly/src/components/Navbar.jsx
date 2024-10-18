import React from 'react'
import { Link } from 'react-router-dom'
import Dropdown from './Dropdown'

const Navbar = () => {
    const options = [{
        name: 'My Profile', route: "/profile", svg: (< svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg >
        )
    }, {
        name: 'Logout', route: '/logout', svg: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>
        )
    }]
    return (
        <header class="bg-white">
            <div class="flex h-16 px-6 items-center gap-8 ">
                <div class="flex flex-1 items-center justify-end md:justify-between">
                    <nav aria-label="Global" class="hidden md:block">
                        <ul class="flex items-center gap-6 text-sm">
                            <li>
                                <img src="/logo.png" width="140px" alt="" />
                            </li>
                            <li>
                                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> Home  </a>
                            </li>

                            <li>
                                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> Scripts </a>
                            </li>

                        </ul>
                    </nav>

                    <div class="flex items-center gap-4">
                        <div class="sm:flex sm:gap-4 items-center">
                            <Link className='rounded-full p-1' to="/wishlist">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>

                            </Link>
                            {/* <Link> */}
                            <Dropdown icon={<img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />} options={options} />
                            {/* <Link
                                class="block rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                                to="/login"
                            >
                                Login
                            </Link>

                            <Link
                                class="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-600/75 sm:block"
                                to="/create-account"
                            >
                                Register
                            </Link> */}
                        </div>

                        <button
                            class="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden"
                        >
                            <span class="sr-only">Toggle menu</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="size-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar