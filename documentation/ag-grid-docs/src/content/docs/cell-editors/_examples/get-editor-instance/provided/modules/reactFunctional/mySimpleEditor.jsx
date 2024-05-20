import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';

export default forwardRef(({ value, onValueChange, eventKey, rowIndex, column }, ref) => {
    const updateValue = (val) => {
        onValueChange(val === '' ? null : val);
    };

    useEffect(() => {
        let startValue;

        if (eventKey === KEY_BACKSPACE) {
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            startValue = eventKey;
        } else {
            startValue = value;
        }
        if (startValue == null) {
            startValue = '';
        }

        updateValue(startValue);

        refInput.current.focus();
    }, []);

    const refInput = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            myCustomFunction() {
                return {
                    rowIndex: rowIndex,
                    colId: column.getId(),
                };
            },
        };
    });

    return (
        <input
            value={value || ''}
            ref={refInput}
            onChange={(event) => updateValue(event.target.value)}
            className="my-simple-editor"
        />
    );
});
