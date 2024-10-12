import React, { useState, useEffect, useRef } from "react";

const Dropdown = ({ cnt }) => {
    const [isActive, setIsActive] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                closeDropdown();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [dropdownRef]);


    const openDropdown = () => {
        setIsVisible(true);
        setTimeout(() => {
            setIsActive(true);
        }, 10);
    };


    const closeDropdown = () => {
        setIsActive(false);
        setTimeout(() => {
            setIsVisible(false);
        }, 300);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="inline-flex items-center overflow-hidden rounded-md bg-white">
                <button
                    onClick={() => (isActive ? closeDropdown() : openDropdown())}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                >
                    <span className="sr-only">Menu</span>
                    {cnt}
                </button>
            </div>

            {isVisible && (
                <div
                    className={`absolute right-0 z-10 mt-2 w-56 rounded-md border border-gray-100 bg-white shadow-lg transition-opacity duration-300 ease-in-out ${isActive ? "opacity-100" : "opacity-0"
                        }`}
                    role="menu"
                >
                    <div className="p-2">
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-md font-semibold text-green-700 hover:bg-green-50"
                            role="menuitem"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            Add to Favourites
                        </button>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-md font-semibold text-indigo-700 hover:bg-indigo-50"
                            role="menuitem"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Add to Read Later
                        </button>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 font-semibold text-md text-red-700 hover:bg-red-50"
                            role="menuitem"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                            Not Interested
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
