import React, { memo, useEffect, useRef, useState } from 'react';

import type { CustomCellEditorProps } from 'ag-grid-react';

export default memo(({ value, onValueChange, stopEditing }: CustomCellEditorProps) => {
    const isHappy = (value: string) => value === 'Happy';

    const [ready, setReady] = useState(false);
    const refContainer = useRef<HTMLDivElement>(null);

    const checkAndToggleMoodIfLeftRight = (event: any) => {
        if (ready) {
            if (['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) {
                // left and right
                const isLeft = event.key === 'ArrowLeft';
                onValueChange(isLeft ? 'Happy' : 'Sad');
                event.stopPropagation();
            }
        }
    };

    useEffect(() => {
        refContainer.current?.focus();
        setReady(true);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', checkAndToggleMoodIfLeftRight);

        return () => {
            window.removeEventListener('keydown', checkAndToggleMoodIfLeftRight);
        };
    }, [checkAndToggleMoodIfLeftRight, ready]);

    const onClick = (happy: boolean) => {
        onValueChange(happy ? 'Happy' : 'Sad');
        stopEditing();
    };

    const mood = {
        borderRadius: 15,
        border: '1px solid grey',
        backgroundColor: '#e6e6e6',
        padding: 15,
        textAlign: 'center' as const,
        display: 'inline-block',
    };

    const unselected = {
        paddingLeft: 10,
        paddingRight: 10,
        border: '1px solid transparent',
        padding: 4,
    };

    const selected = {
        paddingLeft: 10,
        paddingRight: 10,
        border: '1px solid lightgreen',
        padding: 4,
    };

    const happyStyle = isHappy(value) ? selected : unselected;
    const sadStyle = !isHappy(value) ? selected : unselected;

    return (
        <div
            ref={refContainer}
            style={mood}
            tabIndex={1} // important - without this the key presses wont be caught
        >
            <img
                src="https://www.ag-grid.com/example-assets/smileys/happy.png"
                onClick={() => onClick(true)}
                style={happyStyle}
            />
            <img
                src="https://www.ag-grid.com/example-assets/smileys/sad.png"
                onClick={() => onClick(false)}
                style={sadStyle}
            />
        </div>
    );
});
