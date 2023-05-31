import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

export default forwardRef((props, ref) => {
    const createInitialState = () => {
        let startValue;

        const eventKey = props.eventKey;

        if (eventKey === KEY_BACKSPACE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            // if a letter was pressed, we start with the letter
            startValue = eventKey;
        } else {
            // otherwise we start with the current value
            startValue = props.value;
        }

        return {
            value: startValue
        };
    };

    const initialState = createInitialState();
    const [value, setValue] = useState(initialState.value);
    const refInput = useRef(null);

    // focus on the input
    useEffect(() => {
        // get ref from React component
        window.setTimeout(() => {
            const eInput = refInput.current;
            eInput.focus();
        });
    }, []);

    /* Utility Methods */
    const isCharacter = props.eventKey && props.eventKey.length === 1;
    const cancelBeforeStart = isCharacter && ('1234567890'.indexOf(props.eventKey) < 0);

    const isLeftOrRight = event => {
        return ['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1;
    };

    const isCharNumeric = charStr => {
        return !!/\d/.test(charStr);
    };

    const isNumericKey = event => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const isBackspace = event => {
        return event.key === KEY_BACKSPACE;
    };

    const finishedEditingPressed = event => {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = event => {
        if (isLeftOrRight(event) || isBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isNumericKey(event)) {
            if (event.preventDefault) event.preventDefault();
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
            className={'simple-input-editor'}
            value={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => onKeyDown(event)}
        />
    );
});
