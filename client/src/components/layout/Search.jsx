const Search = ({ setSearch, placeholder = "Search..." }) => {
  return (
    <div className="relative group">
      <span className="absolute inset-y-0 left-0 z-10 grid w-10 place-content-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors duration-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </span>

      <label htmlFor="Search" className="sr-only">
        Search
      </label>

      <input
        onChange={(e) => setSearch(e.currentTarget.value)}
        type="text"
        id="Search"
        placeholder={placeholder}
        className="w-full bg-white/5  border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30 font-mono shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      />
    </div>
  );
};

export default Search;
