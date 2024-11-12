import React, { useState, useEffect, useRef } from "react";

const Notification = ({ icon }) => {
    const [isActive, setIsActive] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const dropdownRef = useRef(null);
    const notifications = [
        {
            title: "Introduction to AI",
            scriptName: "intro_ai",
            time: "00:02:30",
            icon: "🎬",
        },
        {
            title: "What is Machine Learning?",
            scriptName: "ml_overview",
            time: "00:05:15",
            icon: "🤖",
        },
        {
            title: "Understanding Neural Networks",
            scriptName: "neural_networks",
            time: "00:08:45",
            icon: "🔗",
        },
        {
            title: "Practical Use Cases of AI",
            scriptName: "ai_use_cases",
            time: "00:12:00",
            icon: "💡",
        },
        {
            title: "Challenges in AI Development",
            scriptName: "ai_challenges",
            time: "00:15:20",
            icon: "⚠️",
        },
        {
            title: "Future of Artificial Intelligence",
            scriptName: "ai_future",
            time: "00:20:10",
            icon: "🔮",
        },
    ];

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
            <div className="flex items-center overflow-hidden rounded-md bg-white">
                <button
                    onClick={() => (isActive ? closeDropdown() : openDropdown())}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                >
                    <span className="sr-only">Menu</span>
                    {icon}
                </button>
            </div>
            {isVisible && (
                <div
                    className={`absolute right-0 z-10 mt-2 w-96 rounded-md border border-gray-100 bg-white shadow-lg transition-opacity duration-300 ease-in-out ${isActive ? "opacity-100" : "opacity-0"
                        }`}
                    role="menu"
                >
                    <div className="flex flex-col gap-3 p-3" >
                        {notifications.map((notification, i) => <>
                            <div className="flex gap-4 items-center">
                                {notification.icon}
                                <div
                                    type="submit"
                                    className="flex w-full flex-col rounded-lg text-md font-semibold"
                                    role="menuitem"
                                >
                                    <p className="text-lg font-bold" > {notification.title}</p>
                                    <p className="text-md font-semibold text-gray-500" >{notification.scriptName}</p>
                                </div>
                            </div>
                            {i != notifications.length - 1 ? <hr /> : null}
                        </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;
