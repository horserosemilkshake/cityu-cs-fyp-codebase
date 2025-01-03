import React, { useState, useEffect } from 'react';
import MaskedText from './MaskedText';

export const Infobar = ({ imgsrc = "", message = "", masked = false}) => {

    return (
        <div
            className='bg-gray-200 border border-gray-400 hover:bg-gray-300 text-gray-800 font-semibold min-w-64 flex flex-row items-center w-full py-2 my-2 rounded-md shadow-md overflow-auto transition-all duration-500 hover:scale-110'
        >
            {imgsrc != "" && <img src={imgsrc} className='w-8 h-8 mx-2'></img>}
            {!masked ? <h1 className='mx-2 my-1 text-ellipsis overflow-hidden'>{message}</h1> : <MaskedText text={message}></MaskedText>}
        </div>
    );
};
