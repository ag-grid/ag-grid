'use strict';

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, memo, useRef, useState } from 'react';
import ReactDOM, { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const KEY_BACKSPACE = 'Backspace';
const KEY_DELETE = 'Delete';
const KEY_F2 = 'F2';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

const DoublingEditor = memo(forwardRef((props, ref) => {
    const [value, setValue] = useState(parseInt(props.value));
    const refInput = useRef(null);

    useEffect(() => {
        // focus on the input
        refInput.current.focus()
    }, []);

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
        return {
            // the final value to send to the grid, on completion of editing
            getValue() {
                // this simple editor doubles any value entered into the input
                return value * 2;
            },

            // Gets called once before editing starts, to give editor a chance to
            // cancel the editing before it even starts.
            isCancelBeforeStart() {
                return false;
            },

            // Gets called once when editing is finished (eg if Enter is pressed).
            // If you return true, then the result of the edit will be ignored.
            isCancelAfterEnd() {
                // our editor will reject any value greater than 1000
                return value > 1000;
            }
        };
    });

    return (
        <input type="number"
            ref={refInput}
            value={value}
            onChange={event => setValue(event.target.value)}
            style={{ width: "100%" }}
        />
    );
}));

const MoodRenderer = memo(props => {
    const imageForMood = mood => 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const mood = useMemo(() => imageForMood(props.value), [props.value]);

    return (
        <img width="20px" src={mood} />
    );
});

const MoodEditor = memo(forwardRef((props, ref) => {
    const isHappy = value => value === 'Happy';

    const [ready, setReady] = useState(false);
    const [interimValue, setInterimValue] = useState(isHappy(props.value));
    const [happy, setHappy] = useState(null);
    const refContainer = useRef(null);

    const checkAndToggleMoodIfLeftRight = (event) => {
        if (ready) {
            if (['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) { // left and right
                setInterimValue(!interimValue);
                event.stopPropagation();
            } else if (event.key === KEY_ENTER) {
                setHappy(interimValue)
                event.stopPropagation();
            }
        }
    };

    useEffect(() => {
        ReactDOM.findDOMNode(refContainer.current).focus();
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

    const mood = {
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
}));

const NumericEditor = memo(forwardRef((props, ref) => {
    const createInitialState = () => {
        let startValue;
        let highlightAllOnFocus = true;

        if (props.key === KEY_BACKSPACE || props.key === KEY_DELETE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (props.charPress) {
            // if a letter was pressed, we start with the letter
            startValue = props.charPress;
            highlightAllOnFocus = false;
        } else {
            // otherwise we start with the current value
            startValue = props.value;
            if (props.key === KEY_F2) {
                highlightAllOnFocus = false;
            }
        }

        return {
            value: startValue,
            highlightAllOnFocus
        };
    };

    const initialState = createInitialState();
    const [value, setValue] = useState(initialState.value);
    const [highlightAllOnFocus, setHighlightAllOnFocus] = useState(initialState.highlightAllOnFocus);
    const refInput = useRef(null);

    // focus on the input
    useEffect(() => {
        // get ref from React component
        const eInput = refInput.current;
        eInput.focus();
        if (highlightAllOnFocus) {
            eInput.select();

            setHighlightAllOnFocus(false);
        } else {
            // when we started editing, we want the caret at the end, not the start.
            // this comes into play in two scenarios: 
            //   a) when user hits F2 
            //   b) when user hits a printable character
            const length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
                eInput.setSelectionRange(length, length);
            }
        }
    }, []);

    /* Utility Methods */
    const cancelBeforeStart = props.charPress && ('1234567890'.indexOf(props.charPress) < 0);

    const isLeftOrRight = event => {
        return ['ArrowLeft', 'ArrowLeft'].indexOf(event.key) > -1;
    };

    const isCharNumeric = charStr => {
        return !!/\d/.test(charStr);
    };

    const isKeyPressedNumeric = event => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const deleteOrBackspace = event => {
        return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.key) > -1;
    };

    const finishedEditingPressed = event => {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = event => {
        if (isLeftOrRight(event) || deleteOrBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }

        if (finishedEditingPressed(event)) {
            props.stopEditing();
        }
    };

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
        return {
            // the final value to send to the grid, on completion of editing
            getValue() {
                return value;
            },

            // Gets called once before editing starts, to give editor a chance to
            // cancel the editing before it even starts.
            isCancelBeforeStart() {
                return cancelBeforeStart;
            },

            // Gets called once when editing is finished (eg if Enter is pressed).
            // If you return true, then the result of the edit will be ignored.
            isCancelAfterEnd() {
                // will reject the number if it greater than 1,000,000
                // not very practical, but demonstrates the method.
                return value > 1000000;
            }
        };
    });

    return (
        <input ref={refInput}
            value={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => onKeyDown(event)}
            style={{ width: "100%" }}
        />
    );
}));

const GridExample = () => {
    const [rowData] = useState([
        { name: "Bob", mood: "Happy", number: 10 },
        { name: "Harry", mood: "Sad", number: 3 },
        { name: "Sally", mood: "Happy", number: 20 },
        { name: "Mary", mood: "Sad", number: 5 },
        { name: "John", mood: "Happy", number: 15 },
        { name: "Jack", mood: "Happy", number: 25 },
        { name: "Sue", mood: "Sad", number: 43 },
        { name: "Sean", mood: "Sad", number: 1335 },
        { name: "Niall", mood: "Happy", number: 2 },
        { name: "Alberto", mood: "Happy", number: 123 },
        { name: "Fred", mood: "Sad", number: 532 },
        { name: "Jenny", mood: "Happy", number: 34 },
        { name: "Larry", mood: "Happy", number: 13 },
    ]);

    const columnDefs = useMemo(() => [
        {
            headerName: 'Doubling',
            field: 'number',
            cellEditor: DoublingEditor,
            cellEditorPopup: true,
            editable: true,
            width: 300,
        },
        {
            field: 'mood',
            cellRenderer: MoodRenderer,
            cellEditor: MoodEditor,
            cellEditorPopup: true,
            editable: true,
            width: 300,
        },
        {
            headerName: 'Numeric',
            field: 'number',
            cellEditor: NumericEditor,
            cellEditorPopup: true,
            editable: true,
            width: 280,
        },
    ], [])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                style={{
                    height: '100%',
                    width: '100%'
                }}
                className="ag-theme-alpine test-grid">
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        flex: 1,
                        minWidth: 100,
                        filter: true,
                        resizable: true
                    }}>
                </AgGridReact>
            </div>
        </div>
    );
};

render(
    <GridExample />,
    document.querySelector('#root')
);
