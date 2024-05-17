import { useGridCellEditor } from '@ag-grid-community/react';
import React, { memo, useCallback, useEffect, useRef } from 'react';

export default memo(({ value, onValueChange, eventKey, cellStartedEdit }) => {
    const refInput = useRef(null);

    const updateValue = (val) => {
        onValueChange(val === '' ? null : parseInt(val));
    };

    useEffect(() => {
        updateValue(isCharNumeric(eventKey) ? eventKey : value);

        // we only want to highlight this cell if it started the edit; it's possible
        // another cell in this row started the edit
        if (cellStartedEdit) {
            refInput.current.focus();
            refInput.current.select();
        }
    }, []);

    const isCharNumeric = (charStr) => {
        return charStr != null && !!/^\d+$/.test(charStr);
    };

    const isNumericKey = (event) => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const onKeyDown = (event) => {
        if (!event.key || event.key.length !== 1 || isNumericKey(event)) {
            return;
        }
        refInput.current.focus();

        if (event.preventDefault) event.preventDefault();
    };

    // when we tab into this editor, we want to focus the contents
    const focusIn = useCallback(() => {
        refInput.current.focus();
        refInput.current.select();
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
            onChange={(event) => updateValue(event.target.value)}
            onKeyDown={(event) => onKeyDown(event)}
            className="ag-input-field-input"
        />
    );
});
