import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useGridCellEditor } from 'ag-grid-react';
import type { CustomCellEditorProps } from 'ag-grid-react';

export default memo(({ value, onValueChange, validate }: CustomCellEditorProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState(value || '');

    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

    const getValidationErrors = useCallback(() => {
        const trimmed = internalValue.trim();
        return phoneRegex.test(trimmed) ? null : ['Invalid phone format. Use (123) 456-7890'];
    }, [internalValue]);

    const getValidationElement = useCallback(() => {
        return inputRef.current!;
    }, []);

    useGridCellEditor({
        getValidationErrors,
        getValidationElement,
    });

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInternalValue(val);
        onValueChange(val);
        setTimeout(() => {
            validate?.(); // AG Grid will now call getValidationErrors using latest value
        });
    };

    const onBlur = () => {
        validate?.();
    };

    return (
        <input
            ref={inputRef}
            type="text"
            className="phone-cell-editor"
            value={internalValue}
            onChange={onChange}
            onBlur={onBlur}
            pattern="^\(\d{3}\)\s\d{3}-\d{4}$"
            placeholder="(123) 456-7890"
        />
    );
});
