import React, { memo, useCallback, useEffect, useRef } from 'react';

import type { CustomCellEditorProps } from 'ag-grid-react';
import { useGridCellEditor } from 'ag-grid-react';

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';
const KEY_F2 = 'F2';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

export default memo(({ value, onValueChange, eventKey, stopEditing }: CustomCellEditorProps) => {
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
        return !!/^\d+$/.test(charStr);
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
        return !!eventKey && eventKey.length === 1 && '1234567890'.indexOf(eventKey) < 0;
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
        <input
            ref={refInput}
            value={value == null ? '' : value}
            onChange={(event: any) => updateValue(event.target.value)}
            onKeyDown={(event: any) => onKeyDown(event)}
            className="numeric-input"
        />
    );
});
