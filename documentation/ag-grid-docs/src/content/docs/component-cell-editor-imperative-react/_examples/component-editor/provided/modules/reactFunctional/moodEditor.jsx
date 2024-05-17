import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';

export default memo(
    forwardRef((props, ref) => {
        const isHappy = (value) => value === 'Happy';

        const [ready, setReady] = useState(false);
        const [happy, setHappy] = useState(isHappy(props.value));
        const [done, setDone] = useState(false);
        const refContainer = useRef(null);

        const checkAndToggleMoodIfLeftRight = (event) => {
            if (ready) {
                if (['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) {
                    // left and right
                    const isLeft = event.key === 'ArrowLeft';
                    setHappy(isLeft);
                    event.stopPropagation();
                }
            }
        };

        useEffect(() => {
            if (done) props.stopEditing();
        }, [done]);

        useEffect(() => {
            refContainer.current.focus();
            setReady(true);
        }, []);

        useEffect(() => {
            window.addEventListener('keydown', checkAndToggleMoodIfLeftRight);

            return () => {
                window.removeEventListener('keydown', checkAndToggleMoodIfLeftRight);
            };
        }, [checkAndToggleMoodIfLeftRight, ready]);

        useImperativeHandle(ref, () => {
            return {
                getValue() {
                    return happy ? 'Happy' : 'Sad';
                },
            };
        });

        const mood = {
            borderRadius: 15,
            border: '1px solid grey',
            backgroundColor: '#e6e6e6',
            padding: 15,
            textAlign: 'center',
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

        const happyStyle = happy ? selected : unselected;
        const sadStyle = !happy ? selected : unselected;

        return (
            <div
                ref={refContainer}
                style={mood}
                tabIndex={1} // important - without this the key presses wont be caught
            >
                <img
                    src="https://www.ag-grid.com/example-assets/smileys/happy.png"
                    onClick={() => {
                        setHappy(true);
                        setDone(true);
                    }}
                    style={happyStyle}
                />
                <img
                    src="https://www.ag-grid.com/example-assets/smileys/sad.png"
                    onClick={() => {
                        setHappy(false);
                        setDone(true);
                    }}
                    style={sadStyle}
                />
            </div>
        );
    })
);
