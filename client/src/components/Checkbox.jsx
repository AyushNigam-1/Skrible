import React, { useState } from 'react';

const ToggleSwitch = () => {
    const [isChecked, setIsChecked] = useState(false);

    const handleToggle = () => {
        setIsChecked((prev) => !prev);
    };

    return (
        <label
            htmlFor="AcceptConditions"
            className={`relative inline-block h-8 w-14 cursor-pointer rounded-full transition ${isChecked ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
        >
            <input
                type="checkbox"
                id="AcceptConditions"
                className="sr-only"
                checked={isChecked}
                onChange={handleToggle}
            />

            <span
                className={`absolute inset-y-0 m-1 inline-flex size-6 items-center justify-center rounded-full bg-white transition-all ${isChecked ? 'start-6 text-indigo-600' : 'text-gray-400 start-0'
                    }`}
            >
                {/* SVG for unchecked state */}
                {!isChecked && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
                {/* SVG for checked state */}
                {isChecked && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </span>
        </label>
    );
};

export default ToggleSwitch;
