'use strict';

import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import ReactDOM, {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';

import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;

const MoodRenderer = forwardRef((props, ref) => {
    const imageForMood = mood => mood === 'Happy' ? 'https://www.ag-grid.com/images/smiley.png' : 'https://www.ag-grid.com/images/smiley-sad.png';

    const [mood, setMood] = useState(imageForMood(props.value));

    useImperativeHandle(ref, () => {
        return {
            refresh(params) {
                setMood(imageForMood(params.value));
            }
        }
    });

    return (
        <img width="20px" src={mood}/>
    );
});

const MoodEditor = forwardRef((props, ref) => {
    const isHappy = value => value === "Happy";

    const [happy, setHappy] = useState(isHappy(props.value));
    const [editing, setEditing] = useState(true);
    const refContainer = useRef(null);

    useEffect(() => {
        focus();
    }, []);

    const checkAndToggleMoodIfLeftRight = (event) => {
        if ([37, 39].indexOf(event.keyCode) > -1) { // left and right
            setHappy(!happy);
            event.stopPropagation();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', checkAndToggleMoodIfLeftRight);

        return () => {
            window.removeEventListener('keydown', checkAndToggleMoodIfLeftRight);
        };
    }, [checkAndToggleMoodIfLeftRight]);

    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return happy ? "Happy" : "Sad";
            },

            isPopup() {
                return true;
            }
        }
    });

    useEffect(() => {
        if (!editing) {
            props.api.stopEditing()
        }
    }, [editing]);

    const focus = () => {
        window.setTimeout(() => {
            let container = ReactDOM.findDOMNode(refContainer.current);
            if (container) {
                container.focus();
            }
        })
    };

    const mood = {
        borderRadius: 15,
        border: "1px solid grey",
        background: "#e6e6e6",
        padding: 15,
        textAlign: "center",
        display: "inline-block"
    };

    const unselected = {
        paddingLeft: 10,
        paddingRight: 10,
        border: "1px solid transparent",
        padding: 4
    };

    const selected = {
        paddingLeft: 10,
        paddingRight: 10,
        border: "1px solid lightgreen",
        padding: 4
    };

    const happyStyle = happy ? selected : unselected;
    const sadStyle = !happy ? selected : unselected;

    return (
        <div ref={refContainer}
             style={mood}
             tabIndex={1} // important - without this the key presses wont be caught
        >
            <img src="https://www.ag-grid.com/images/smiley.png" onClick={() => {
                setHappy(true);
                setEditing(false);
            }} style={happyStyle}/>
            <img src="https://www.ag-grid.com/images/smiley-sad.png" onClick={() => {
                setHappy(false);
                setEditing(false);
            }} style={sadStyle}/>
        </div>
    );
});

const NumericEditor = forwardRef((props, ref) => {
    const createInitialState = () => {
        let startValue;
        let highlightAllOnFocus = true;

        if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (props.charPress) {
            // if a letter was pressed, we start with the letter
            startValue = props.charPress;
            highlightAllOnFocus = false;
        } else {
            // otherwise we start with the current value
            startValue = props.value;
            if (props.keyPress === KEY_F2) {
                highlightAllOnFocus = false;
            }
        }

        return {
            value: startValue,
            highlightAllOnFocus
        }
    };

    const initialState = createInitialState();

    const [value, setValue] = useState(initialState.value);
    const [highlightAllOnFocus, setHighlightAllOnFocus] = useState(initialState.highlightAllOnFocus);
    const refInput = useRef(null);

    const cancelBeforeStart = props.charPress && ('1234567890'.indexOf(props.charPress) < 0);

    const isLeftOrRight = event => {
        return [37, 39].indexOf(event.keyCode) > -1;
    };

    const getCharCodeFromEvent = event => {
        event = event || window.event;
        return (typeof event.which === "undefined") ? event.keyCode : event.which;
    };

    const isCharNumeric = charStr => {
        return !!/\d/.test(charStr);
    };

    const isKeyPressedNumeric = event => {
        const charCode = getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        return isCharNumeric(charStr);
    };

    const deleteOrBackspace = event => {
        return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.keyCode) > -1;
    };

    const finishedEditingPressed = event => {
        const charCode = getCharCodeFromEvent(event);
        return charCode === KEY_ENTER || charCode === KEY_TAB;
    };
    const onKeyDown = event => {
        if (isLeftOrRight(event) || deleteOrBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);

    useImperativeHandle(ref, () => {
        return {
            afterGuiAttached() {
                // get ref from React component
                const eInput = refInput.current;
                eInput.focus();
                if (highlightAllOnFocus) {
                    eInput.select();

                    setHighlightAllOnFocus(false);
                } else {
                    // when we started editing, we want the carot at the end, not the start.
                    // comes into play in two scenarios: a) when user hits F2 and b)
                    // when user hits a printable character, then on IE (and only IE) the carot
                    // was placed after the first character, thus 'apply' would end up as 'pplea'
                    const length = eInput.value ? eInput.value.length : 0;
                    if (length > 0) {
                        eInput.setSelectionRange(length, length);
                    }
                }
            },

            getValue() {
                return value;
            },

            isCancelBeforeStart() {
                return cancelBeforeStart;
            },

            // will reject the number if it greater than 1,000,000
            // not very practical, but demonstrates the method.
            isCancelAfterEnd() {
                return value > 1000000;
            }
        }
    });

    return (
        <input ref={refInput}
               value={value}
               onChange={event => setValue(event.target.value)}
               style={{width: "100%"}}
        />
    );
});

const GridExample = () => {
    const rowData = [
        {name: "Bob", mood: "Happy", number: 10},
        {name: "Harry", mood: "Sad", number: 3},
        {name: "Sally", mood: "Happy", number: 20},
        {name: "Mary", mood: "Sad", number: 5},
        {name: "John", mood: "Happy", number: 15},
        {name: "Jack", mood: "Happy", number: 25},
        {name: "Sue", mood: "Sad", number: 43},
        {name: "Sean", mood: "Sad", number: 1335},
        {name: "Niall", mood: "Happy", number: 2},
        {name: "Alberto", mood: "Happy", number: 123},
        {name: "Fred", mood: "Sad", number: 532},
        {name: "Jenny", mood: "Happy", number: 34},
        {name: "Larry", mood: "Happy", number: 13},
    ];

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div
                style={{
                    height: '100%',
                    width: '100%'
                }}
                className="ag-theme-alpine test-grid">
                <AgGridReact
                    modules={AllModules}
                    rowData={rowData}
                    frameworkComponents={{
                        moodRenderer: MoodRenderer,
                        moodEditor: MoodEditor,
                        numericEditor: NumericEditor
                    }}
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        flex: 1,
                        minWidth: 100,
                        filter: true,
                        resizable: true
                    }}>
                    <AgGridColumn field="name"
                                  width={300}
                                  editable={true}
                                  cellEditor="agRichSelectCellEditor"
                                  cellEditorParams={{
                                      values: [
                                          "Bob",
                                          "Harry",
                                          "Sally",
                                          "Mary",
                                          "John",
                                          "Jack",
                                          "Sue",
                                          "Sean",
                                          "Niall",
                                          "Albert",
                                          "Fred",
                                          "Jenny",
                                          "Larry"
                                      ]
                                  }}/>
                    <AgGridColumn field="mood"
                                  cellRenderer="moodRenderer"
                                  cellEditor="moodEditor"
                                  editable={true}
                                  width={300}/>
                    <AgGridColumn headerName="Numeric"
                                  field="number"
                                  cellEditor="numericEditor"
                                  editable={true}
                                  width={280}/>
                </AgGridReact>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
