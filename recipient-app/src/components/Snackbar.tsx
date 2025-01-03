import React, { useState, useEffect } from 'react';

export const Snackbar = ({ message = "", isVisible = false, onClose = () => { } }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-32 py-2 rounded-md shadow-md transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            {message}
        </div>
    );
};
