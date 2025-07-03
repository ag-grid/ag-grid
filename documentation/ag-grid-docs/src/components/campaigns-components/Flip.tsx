import Tick from '@pqina/flip';
import '@pqina/flip/dist/flip.min.css';
import React, { useEffect, useRef } from 'react';

interface FlipProps {
    value: string | number;
}

const Flip: React.FC<FlipProps> = ({ value }) => {
    const root = useRef<HTMLDivElement>(null);
    const tick = useRef<any>(null);

    // mount
    useEffect(() => {
        tick.current = Tick.DOM.create(root.current!, { value });
        return () => tick.current?.destroy();
    }, []);

    // update
    useEffect(() => {
        if (tick.current) tick.current.value = value;
    }, [value]);

    return (
        <div ref={root} className="tick">
            {/* one flipper for the whole value */}
            <span data-view="flip" />
        </div>
    );
};

export default Flip;
