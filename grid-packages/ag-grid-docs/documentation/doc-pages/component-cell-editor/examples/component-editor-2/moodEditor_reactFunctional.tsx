import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ICellEditorParams } from "@ag-grid-community/core";

export default forwardRef((props: ICellEditorParams, ref) => {
    const isHappy = (value: string) => value === 'Happy';

    const [ready, setReady] = useState(false);
    const [interimValue, setInterimValue] = useState(isHappy(props.value));
    const [happy, setHappy] = useState<boolean | null>(null);
    const refContainer = useRef<any>(null);

    const checkAndToggleMoodIfLeftRight = (event: any) => {
        if (ready) {
            if (['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) { // left and right
                setInterimValue(!interimValue);
                event.stopPropagation();
            } else if (event.key === "Enter") {
                setHappy(interimValue)
                event.stopPropagation();
            }
        }
    };

    useEffect(() => {
        (ReactDOM.findDOMNode(refContainer.current) as any).focus();
        setReady(true);
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', checkAndToggleMoodIfLeftRight);

        return () => {
            window.removeEventListener('keydown', checkAndToggleMoodIfLeftRight);
        };
    }, [checkAndToggleMoodIfLeftRight, ready]);

    useEffect(() => {
        if (happy !== null) {
            props.stopEditing();
        }
    }, [happy])

    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return happy ? 'Happy' : 'Sad';
            }
        };
    });

    const mood: any = {
        borderRadius: 15,
        border: '1px solid grey',
        background: '#e6e6e6',
        padding: 15,
        textAlign: 'center',
        display: 'inline-block'
    };

    const unselected = {
        paddingLeft: 10,
        paddingRight: 10,
        border: '1px solid transparent',
        padding: 4
    };

    const selected = {
        paddingLeft: 10,
        paddingRight: 10,
        border: '1px solid lightgreen',
        padding: 4
    };

    const happyStyle = interimValue ? selected : unselected;
    const sadStyle = !interimValue ? selected : unselected;

    return (
        <div ref={refContainer}
            style={mood}
            tabIndex={1} // important - without this the key presses wont be caught
        >
            <img src="https://www.ag-grid.com/example-assets/smileys/happy.png" onClick={() => {
                setHappy(true);
            }} style={happyStyle} />
            <img src="https://www.ag-grid.com/example-assets/smileys/sad.png" onClick={() => {
                setHappy(false);
            }} style={sadStyle} />
        </div>
    );
});
