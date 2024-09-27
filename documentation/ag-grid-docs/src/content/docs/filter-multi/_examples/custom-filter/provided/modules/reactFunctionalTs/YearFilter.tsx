import React, { useCallback, useRef } from 'react';

import type { IAfterGuiAttachedParams, IDoesFilterPassParams } from 'ag-grid-community';
import type { CustomFilterProps } from 'ag-grid-react';
import { useGridFilter } from 'ag-grid-react';

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
