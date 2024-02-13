import React, { memo, useCallback, useEffect, useRef } from "react";
import { CustomCellEditorProps, useGridCellEditor } from "@ag-grid-community/react";

// this simple editor doubles any value entered into the input
export default memo(({ value, onValueChange }: CustomCellEditorProps) => {
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
            value={value == null ? '' : (value / 2)}
            onChange={({ target: { value: newValue }}) => onValueChange(newValue == '' ? null : (parseInt(newValue) * 2))}
            className="doubling-input"
        />
    );
});
