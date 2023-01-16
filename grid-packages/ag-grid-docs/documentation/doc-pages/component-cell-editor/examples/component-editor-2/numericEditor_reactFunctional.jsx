import React, {forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";

const KEY_F2 = 'F2';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';

export default memo(forwardRef((props, ref) => {
    const createInitialState = () => {
        let startValue;
        let highlightAllOnFocus = true;

        if (props.charPress) {
            // if a letter was pressed, we start with the letter
            startValue = props.charPress;
            highlightAllOnFocus = false;
        } else {
            // otherwise we start with the current value
            startValue = props.value;
            if (props.eventKey === KEY_F2) {
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
        return [KEY_ARROW_LEFT, KEY_ARROW_RIGHT].indexOf(event.key) > -1;
    };

    const isCharNumeric = charStr => {
        return !!/\d/.test(charStr);
    };

    const isKeyPressedNumeric = event => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const finishedEditingPressed = event => {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = event => {
        if (isLeftOrRight(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }

        if(finishedEditingPressed(event)) {
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
               className='numeric-input'
        />
    );
}));
