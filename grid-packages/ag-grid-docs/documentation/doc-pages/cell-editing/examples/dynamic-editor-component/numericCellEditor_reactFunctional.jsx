import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;

export default forwardRef((props, ref) => {
    const createInitialState = () => {
        let startValue;

        if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (props.charPress) {
            // if a letter was pressed, we start with the letter
            startValue = props.charPress;
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
        />
    );
});
