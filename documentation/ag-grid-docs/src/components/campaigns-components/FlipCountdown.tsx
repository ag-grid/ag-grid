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

const FlipCountdown: React.FC<{
    days?: number;
    onCountdownEnd?: () => void;
    isEnded?: boolean;
    onEndedChange?: (ended: boolean) => void;
}> = ({ days = 60, onCountdownEnd, isEnded, onEndedChange }) => {
    //  Set your end date here
    // Examples:
    // const endDate = new Date('2025-01-15T00:00:00Z'); // January 15, 2025 at midnight UTC
    // const endDate = new Date(Date.UTC(2025, 0, 15, 0, 0, 0)); // January 15, 2025 at midnight UTC
    // const endDate = new Date('2025-03-31T23:59:59Z'); // March 31, 2025 at 11:59:59 PM UTC

    const endDate = new Date(Date.UTC(2024, 11, 16, 0, 0, 0)); // December 16th, 2024 (yesterday) at midnight UTC

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
                    console.log('Countdown reached zero - triggering end state');
                    setHasEnded(true);
                    console.log('Calling onEndedChange with true');
                    onEndedChange?.(true);
                    onCountdownEnd?.();

                    // Call global function to update content
                    if (typeof window !== 'undefined' && window.updateContentOnCountdownEnd) {
                        console.log('Calling global function');
                        window.updateContentOnCountdownEnd();
                    }
                }
            }
        }, 1000);
        return () => clearInterval(handle);
    }, [days, hasEnded, onCountdownEnd, onEndedChange]);

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
