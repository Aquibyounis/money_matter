import React, { useEffect, useRef, useState } from 'react';

const AnimatedCounter = ({ value, duration = 800, prefix = '' }) => {
    const [display, setDisplay] = useState(0);
    const prevValue = useRef(0);
    const frameRef = useRef(null);

    useEffect(() => {
        const start = prevValue.current;
        const end = value;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;
            setDisplay(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                prevValue.current = end;
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value, duration]);

    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(display));

    return <span>{prefix}{formatted}</span>;
};

export default AnimatedCounter;
