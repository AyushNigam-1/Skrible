import React from 'react'

const Search = ({setSearch}) => {
    return (
        <div class="relative">
            <span class="absolute inset-y-0 start-0 grid w-10 place-content-center">
                <button type="button" class="text-gray-400 ">
                    <span class="sr-only">Search ...</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        class="size-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                </button>
            </span>
            <label for="Search" class="sr-only"> Search </label>
            <input
            onChange={(e) => setSearch(e.currentTarget.value)}
                type="text"
                id="Search"
                placeholder="Search"
                class="w-72  h-14 bg-gray-200/50 rounded-lg py-2 ps-10 text-lg outline-none px-3"
            />

        </div>
    )
}

export default Search