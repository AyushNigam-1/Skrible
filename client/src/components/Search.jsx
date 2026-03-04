const Search = ({ setSearch }) => {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 start-0 grid w-10 place-content-center">
        <button type="button" className="text-gray-400 ">
          <span className="sr-only">Search ...</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </span>
      <label for="Search" className="sr-only">
        {" "}
        Search{" "}
      </label>
      <input
        onChange={(e) => setSearch(e.currentTarget.value)}
        type="text"
        id="Search"
        placeholder="Search"
        className="w-72 bg-white/5 border border-gray-700 rounded-2xl py-2 ps-10 text-lg outline-none px-3"
      />
    </div>
  );
};

export default Search;
