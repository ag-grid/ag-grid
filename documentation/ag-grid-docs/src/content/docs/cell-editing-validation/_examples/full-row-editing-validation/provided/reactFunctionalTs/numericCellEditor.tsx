import React, { memo, useCallback, useEffect, useRef } from 'react';

import type { CustomCellEditorProps } from 'ag-grid-react';
import { useGridCellEditor } from 'ag-grid-react';

export default memo(({ value, onValueChange, eventKey, cellStartedEdit }: CustomCellEditorProps) => {
    const refInput = useRef<HTMLInputElement>(null);

    const updateValue = (val: string) => {
        onValueChange(val === '' ? null : parseInt(val));
    };

    useEffect(() => {
        updateValue(isCharNumeric(eventKey) ? eventKey : value);

        // we only want to highlight this cell if it started the edit; it's possible
        // another cell in this row started the edit
        if (cellStartedEdit) {
            refInput.current?.focus();
            refInput.current?.select();
        }
    }, []);

    const isCharNumeric = (charStr: string | null) => {
        return charStr != null && !!/^\d+$/.test(charStr);
    };

    const isNumericKey = (event: any) => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const onKeyDown = (event: any) => {
        if (!event.key || event.key.length !== 1 || isNumericKey(event)) {
            return;
        }
        refInput.current?.focus();

        if (event.preventDefault) event.preventDefault();
    };

    // when we tab into this editor, we want to focus the contents
    const focusIn = useCallback(() => {
        refInput.current?.focus();
        refInput.current?.select();
        console.log('NumericCellEditor.focusIn()');
    }, []);

    // when we tab out of the editor, this gets called
    const focusOut = useCallback(() => {
        console.log('NumericCellEditor.focusOut()');
    }, []);

    useGridCellEditor({
        focusIn,
        focusOut,
    });

    return (
        <input
            ref={refInput}
            value={value == null ? '' : value}
            onChange={(event: any) => updateValue(event.target.value)}
            onKeyDown={(event: any) => onKeyDown(event)}
            className="ag-input-field-input"
        />
    );
});
