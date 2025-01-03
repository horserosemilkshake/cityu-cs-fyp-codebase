import React, { useState, useEffect } from 'react';
import MaskedText from './MaskedText';
import { useNavigate } from 'react-router-dom';

export const PackageAvatar = ({ id = "", description = "", jsonified = "", handler = (p0: string) => {}}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleClick = () => {
        setIsCollapsed((prevState) => !prevState);
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
            <div
                className="px-6 py-4 cursor-pointer flex justify-between items-center"
                onClick={handleClick}
            >
                <span className="font-bold text-gray-800">{id}</span>
                <svg
                    className={`h-6 w-6 transition-transform ${isCollapsed ? 'transform rotate-0' : 'transform rotate-180'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
            {!isCollapsed && (
                <div className="px-6 py-4 border-t flex flex-col justify-center items-center">
                    <p className="text-gray-600 text-lg">{description}</p>
                    <button
                        className="min-h-8 bg-gray-200 text-lg hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                        onClick={() => {handler(jsonified)}}
                    >
                        Click to see more details on map
                    </button>
                </div>
            )}
        </div>
    );
};
