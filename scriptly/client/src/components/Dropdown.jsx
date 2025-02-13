import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const Dropdown = ({ icon, options, scriptId }) => {
    const nav = useNavigate()
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
        <div className="relative rounded-3xl" ref={dropdownRef}>
            <div className="flex items-center  overflow-hidden rounded-3xl bg-white">
                <button
                    onClick={() => (isActive ? closeDropdown() : openDropdown())}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-700 "
                >
                    <span className="sr-only">Menu</span>
                    {icon}
                </button>
            </div>

            {isVisible && (
                <div
                    className={`absolute right-0 z-10 mt-2 w-max rounded-md border border-gray-100 bg-white shadow-lg transition-opacity duration-300 ease-in-out ${isActive ? "opacity-100" : "opacity-0"
                        }`}
                    role="menu"
                >
                    <div className="p-2" >
                        {options.map(option => <button
                            to={option.route}
                            onClick={() => option.route ? nav(option.route) : option.fnc(scriptId)}
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-md font-semibold  hover:bg-indigo-50"
                            role="menuitem"
                        >
                            {option.svg}
                            {option.name}
                        </button>)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
