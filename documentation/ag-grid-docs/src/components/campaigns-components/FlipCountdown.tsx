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

interface FlipCountdownProps {
    endDate: Date;
    onCountdownEnd?: () => void;
    isEnded?: boolean;
    onEndedChange?: (ended: boolean) => void;
}

const FlipCountdown: React.FC<FlipCountdownProps> = ({ endDate, onCountdownEnd, isEnded, onEndedChange }) => {
    const [left, setLeft] = useState(() => getTimeLeft(endDate));
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const target = new Date(endDate);
        const handle = setInterval(() => {
            const timeLeft = getTimeLeft(target);
            setLeft(timeLeft);

            // Check if countdown has ended
            if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                if (!hasEnded) {
                    setHasEnded(true);
                    onEndedChange?.(true);
                    onCountdownEnd?.();
                }
            }
        }, 1000);
        return () => clearInterval(handle);
    }, [endDate, hasEnded, onCountdownEnd, onEndedChange]);

    // If countdown has ended, show zeros
    if (hasEnded || isEnded) {
        return <div className="countdownContainer"></div>;
    }

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
