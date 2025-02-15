import React from 'react'

const Search = () => {
    return (
        <div class="relative">
            <label for="Search" class="sr-only"> Search </label>
            <input
                type="text"
                id="Search"
                placeholder="Search for..."
                class="w-72  h-14 bg-gray-100 border-gray-200 rounded-full py-2 pe-10 text-lg shadow-sm outline-none px-3"
            />
            {/* <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                <button type="button" class="text-gray-600 hover:text-gray-700">
                    <span class="sr-only">Search ...</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-4"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                </button>
            </span> */}
        </div>
    )
}

export default Search