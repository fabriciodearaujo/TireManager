import { useState, useEffect, useRef } from 'react';

const CountUp = ({ end, duration = 1000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    startTime.current = null;
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [end, duration]);

  return <>{count}{suffix}</>;
};

export default CountUp;
