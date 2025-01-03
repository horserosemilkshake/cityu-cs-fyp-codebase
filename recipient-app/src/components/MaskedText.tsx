import React, { useState } from 'react';

interface MaskedTextProps {
    text: string | number | null;
}

const MaskedText: React.FC<MaskedTextProps> = ({ text }) => {
    const [isMasked, setIsMasked] = useState(true);

    const handleClick = () => {
        setIsMasked(!isMasked);
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`relative overflow-hidden ${isMasked ? 'cursor-pointer' : ''
                    }`}
                onClick={handleClick}
            >
                <p className='text-ellipsis overflow-hidden'>
                    {text}
                </p>
                {isMasked && (
                    <div className="absolute inset-0 bg-white"></div>
                )}
            </div>
        </div>
    );
};

export default MaskedText;