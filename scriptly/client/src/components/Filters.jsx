import React from 'react'

const Filters = () => {
    return (
        <div class="w-full max-w-sm min-w-[200px]">
            <div class="relative">
                <select
                    class="w-full bg-gray-100  placeholder:text-slate-400 text-gray-700 font-medium  rounded-lg pl-3 h-14 pr-8 py-2 transition duration-300 ease focus:outline-none focus:shadow-none shadow-sm appearance-none cursor-pointer text-center">
                    <option value="brazil">Newly Added</option>
                    <option value="bucharest">Bucharest</option>
                    <option value="london">London</option>
                    <option value="washington">Washington</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="h-5 w-5 ml-1 absolute top-5 right-2.5 text-slate-700">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            </div>
        </div>
    )
}

export default Filters