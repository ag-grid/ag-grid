import React, { useEffect, useState } from 'react';

import Flip from './Flip';

const getTimeLeft = (target: Date) => {
    const now = new Date();
    let diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    const days = Math.floor(diff / (24 * 60 * 60));
    diff -= days * 24 * 60 * 60;
    const hours = Math.floor(diff / (60 * 60));
    diff -= hours * 60 * 60;
    const minutes = Math.floor(diff / 60);
    const seconds = diff - minutes * 60;
    return { days, hours, minutes, seconds };
};

const FlipCountdown: React.FC<{ days?: number }> = ({ days = 60 }) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return getTimeLeft(target);
    });

    useEffect(() => {
        const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(target));
        }, 1000);
        return () => clearInterval(interval);
    }, [days]);

    return (
        <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
            <div>
                <Flip value={timeLeft.days} />
                <div class="font-mono" style={{ textAlign: 'center' }}>
                    Days
                </div>
            </div>
            <div>
                <Flip value={timeLeft.hours} />
                <div class="font-mono" style={{ textAlign: 'center' }}>
                    Hours
                </div>
            </div>
            <div>
                <Flip value={timeLeft.minutes} />
                <div class="font-mono" style={{ textAlign: 'center' }}>
                    Minutes
                </div>
            </div>
            <div>
                <Flip value={timeLeft.seconds} />
                <div class="font-mono" style={{ textAlign: 'center' }}>
                    Seconds
                </div>
            </div>
        </div>
    );
};

export default FlipCountdown;
