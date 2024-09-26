import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import type { ICellEditor } from 'ag-grid-community';
import type { CustomCellEditorProps } from 'ag-grid-react';

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';

export interface MySimpleInterface extends ICellEditor {
    myCustomFunction(): { rowIndex: number; colId: string };
}

export default forwardRef(({ value, onValueChange, eventKey, rowIndex, column }: CustomCellEditorProps, ref) => {
    const updateValue = (val: string) => {
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

        refInput.current?.focus();
    }, []);

    const refInput = useRef<HTMLInputElement>(null);

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
