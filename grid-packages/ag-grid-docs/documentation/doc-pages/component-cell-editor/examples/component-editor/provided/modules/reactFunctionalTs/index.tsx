'use strict';

import React, { useEffect, useMemo, memo, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { AgGridReact, CustomCellEditorProps, CustomCellRendererProps, useGridCellEditor } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, ModuleRegistry } from '@ag-grid-community/core';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import './styles.css';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';
const KEY_F2 = 'F2';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

// this simple editor doubles any value entered into the input
const DoublingEditor = memo(({ value, onValueChange }: CustomCellEditorProps) => {
    const refInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // focus on the input
        refInput.current?.focus();

        onValueChange(value * 2);
    }, []);

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    const isCancelBeforeStart = useCallback(() => {
        return false;
    }, []);

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    const isCancelAfterEnd = useCallback(() => {
        // our editor will reject any value greater than 1000
        return (value / 2) > 1000;
    }, [value]);

    /* Pass Component Editor Lifecycle callbacks to the grid */
    useGridCellEditor({
        isCancelBeforeStart,
        isCancelAfterEnd,
    });

    return (
        <input type="number"
            ref={refInput}
            value={value / 2}
            onChange={({ target: { value: newValue }}) => onValueChange(parseInt(newValue) * 2)}
            className="doubling-input"
        />
    );
});

const MoodRenderer = memo(({ value }: CustomCellRendererProps) => {
    const imageForMood = (mood: string) => 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const mood = useMemo(() => imageForMood(value), [value]);

    return (
        <img width="20px" src={mood} />
    );
});

const MoodEditor = memo(({ value, onValueChange, stopEditing }: CustomCellEditorProps) => {
    const isHappy = (value: string) => value === 'Happy';

    const [ready, setReady] = useState(false);
    const refContainer = useRef(null);

    const checkAndToggleMoodIfLeftRight = (event: any) => {
        if (ready) {
            if (['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) { // left and right
                const isLeft = event.key === 'ArrowLeft';
                onValueChange(isLeft ? 'Happy' : 'Sad');
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

    const happyStyle = isHappy(value) ? selected : unselected;
    const sadStyle = !isHappy(value) ? selected : unselected;

    return (
        <div ref={refContainer}
            style={mood}
            tabIndex={1} // important - without this the key presses wont be caught
        >
            <img src="https://www.ag-grid.com/example-assets/smileys/happy.png" onClick={() => onClick(true)} style={happyStyle} />
            <img src="https://www.ag-grid.com/example-assets/smileys/sad.png" onClick={() => onClick(false)} style={sadStyle} />
        </div>
    );
});

const NumericEditor = memo(({ value, onValueChange, eventKey, stopEditing }: CustomCellEditorProps) => {
    const updateValue = (val: string) => {
        onValueChange(val === '' ? null : parseInt(val));
    };

    useEffect(() => {
        let startValue;
        let highlightAllOnFocus = true;

        if (eventKey === KEY_BACKSPACE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            // if a letter was pressed, we start with the letter
            startValue = eventKey;
            highlightAllOnFocus = false;
        } else {
            // otherwise we start with the current value
            startValue = value;
            if (eventKey === KEY_F2) {
                highlightAllOnFocus = false;
            }
        }
        if (startValue == null) {
            startValue = '';
        }

        updateValue(startValue);

        // get ref from React component
        const eInput = refInput.current!;
        eInput.focus();
        if (highlightAllOnFocus) {
            eInput.select();
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

    const refInput = useRef<HTMLInputElement>(null);

    const isLeftOrRight = (event: any) => {
        return ['ArrowLeft', 'ArrowLeft'].indexOf(event.key) > -1;
    };

    const isCharNumeric = (charStr: string) => {
        return !!/\d/.test(charStr);
    };

    const isNumericKey = (event: any) => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const isBackspace = (event: any) => {
        return event.key === KEY_BACKSPACE;
    };

    const finishedEditingPressed = (event: any) => {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = (event: any) => {
        if (isLeftOrRight(event) || isBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isNumericKey(event)) {
            if (event.preventDefault) event.preventDefault();
        }

        if (finishedEditingPressed(event)) {
            stopEditing();
        }
    };

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    const isCancelBeforeStart = useCallback(() => {
        return !!eventKey && eventKey.length === 1 && ('1234567890'.indexOf(eventKey) < 0);
    }, [eventKey]);

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    const isCancelAfterEnd = useCallback(() => {
        // will reject the number if it greater than 1,000,000
        // not very practical, but demonstrates the method.
        return value != null && value > 1000000;
    }, [value]);

    useGridCellEditor({
        isCancelBeforeStart,
        isCancelAfterEnd,
    });

    return (
        <input ref={refInput}
            value={value}
            onChange={(event: any) => updateValue(event.target.value)}
            onKeyDown={(event: any) => onKeyDown(event)}
            className="numeric-input"
        />
    );
});

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

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Doubling',
            field: 'number',
            cellEditor: DoublingEditor,
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
            editable: true,
            width: 280,
        },
    ], [])

    const defaultColDef = useMemo(() => ({
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    }), []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                style={{
                    height: '100%',
                    width: '100%'
                }}
                className={/** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    reactiveCustomComponents
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<GridExample />);
