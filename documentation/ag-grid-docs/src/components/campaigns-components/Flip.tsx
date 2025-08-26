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
        const initTick = async () => {
            try {
                const Tick = await import('@pqina/flip');
                if (root.current) {
                    tick.current = Tick.default.DOM.create(root.current, { value });
                }
            } catch (error) {
                // Failed to load Tick library
            }
        };

        initTick();

        return () => {
            if (tick.current) {
                tick.current.destroy();
            }
        };
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
