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
    const [left, setLeft] = useState(() => getTimeLeft(new Date(Date.now() + days * 86_400_000)));

    useEffect(() => {
        const target = new Date(Date.now() + days * 86_400_000);
        const handle = setInterval(() => setLeft(getTimeLeft(target)), 1000);
        return () => clearInterval(handle);
    }, [days]);

    return (
        <div class="countdownContainer">
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
