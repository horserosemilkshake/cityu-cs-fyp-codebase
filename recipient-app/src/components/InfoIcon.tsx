import React, { FC } from 'react';

interface InfoIconProps {
  info: string; // the information to be displayed in the alert box
}

const InfoIcon: FC<InfoIconProps> = ({ info }) => {
  const handleClick = () => {
    alert(info);
  };

  return (
    <div className="info-icon hover:animate-pulse" onClick={handleClick}>
       🛈
    </div>
  );
};

export default InfoIcon;