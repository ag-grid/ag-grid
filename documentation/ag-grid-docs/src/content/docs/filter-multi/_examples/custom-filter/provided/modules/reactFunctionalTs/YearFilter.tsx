import { IAfterGuiAttachedParams, IDoesFilterPassParams } from '@ag-grid-community/core';
import { CustomFilterProps, useGridFilter } from '@ag-grid-community/react';
import React, { useCallback, useRef } from 'react';

export default ({ model, onModelChange }: CustomFilterProps) => {
    const refInput = useRef<HTMLInputElement>(null);

    const doesFilterPass = useCallback((params: IDoesFilterPassParams) => {
        return params.data.year >= 2004;
    }, []);

    const afterGuiAttached = useCallback((params?: IAfterGuiAttachedParams) => {
        if (!params || !params.suppressFocus) {
            refInput.current?.focus();
        }
    }, []);

    useGridFilter({
        doesFilterPass,
        afterGuiAttached,
    });

    return (
        <div className="year-filter">
            <label>
                <input
                    ref={refInput}
                    type="radio"
                    name="year"
                    value="All"
                    checked={!model}
                    onChange={() => onModelChange(null)}
                />{' '}
                All
            </label>
            <label>
                <input type="radio" name="year" value="2010" checked={!!model} onChange={() => onModelChange(true)} />{' '}
                After 2004
            </label>
        </div>
    );
};
