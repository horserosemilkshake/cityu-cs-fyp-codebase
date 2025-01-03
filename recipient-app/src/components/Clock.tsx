import React, { useState, useEffect } from 'react';

interface ClockProps {
  initialTime?: Date;
}

const Clock: React.FC<ClockProps> = ({ initialTime = new Date() }) => {
  const [time, setTime] = useState<Date>(initialTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toISOString();

  return (
    <div>
      <p>{formattedTime}.</p>
    </div>
  );
};

export default Clock;