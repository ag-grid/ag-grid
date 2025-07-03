import React, { useEffect, useState } from 'react';

import Flip from './Flip';
import './FlipCountdown.scss';

const pad = (n: number) => String(n).padStart(2, '0');

const getTimeLeft = (target: Date) => {
    const diff = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
    const days = Math.floor(diff / 86_400);
    const hours = Math.floor((diff % 86_400) / 3_600);
    const minutes = Math.floor((diff % 3_600) / 60);
    const seconds = diff % 60;
    return { days, hours, minutes, seconds };
};

const FlipCountdown: React.FC<{ days?: number }> = ({ days = 60 }) => {
    //  00:00 on 1st September 2025 in GMT
    const endDate = new Date(Date.UTC(2025, 8, 1, 0, 0, 0));

    const [left, setLeft] = useState(() => getTimeLeft(endDate));

    useEffect(() => {
        const target = new Date(endDate);
        const handle = setInterval(() => setLeft(getTimeLeft(target)), 1000);
        return () => clearInterval(handle);
    }, [days]);

    return (
        <div className="countdownContainer">
            <div>
                <Flip value={left.days} />
                <div className="font-mono">Days</div>
            </div>
            <div>
                <Flip value={pad(left.hours)} />
                <div className="font-mono">Hours</div>
            </div>
            <div>
                <Flip value={pad(left.minutes)} />
                <div className="font-mono">Mins</div>
            </div>
            <div>
                <Flip value={pad(left.seconds)} />
                <div className="font-mono">Secs</div>
            </div>
        </div>
    );
};

export default FlipCountdown;
