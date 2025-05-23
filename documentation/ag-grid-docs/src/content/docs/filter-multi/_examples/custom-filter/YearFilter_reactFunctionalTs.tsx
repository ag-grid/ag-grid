import type { ChangeEvent } from 'react';
import React, { useCallback, useRef } from 'react';

import type { FilterWrapperParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import type { CustomFilterDisplayProps } from 'ag-grid-react';
import { useGridFilterDisplay } from 'ag-grid-react';

export default ({ model, onModelChange }: CustomFilterDisplayProps<any, any, true> & FilterWrapperParams) => {
    const refInput = useRef<HTMLInputElement>(null);

    const afterGuiAttached = useCallback((params?: IAfterGuiAttachedParams) => {
        if (!params || !params.suppressFocus) {
            // Focus the input element for keyboard navigation.
            // Can't do this in an effect,
            // as the component is not recreated when hidden and then shown again
            refInput.current?.focus();
        }
    }, []);

    // register filter handlers with the grid
    useGridFilterDisplay({
        afterGuiAttached,
    });

    const onYearChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        onModelChange(value === 'All' ? null : true);
    };

    return (
        <div className="year-filter">
            <div>Select Year Range</div>
            <label>
                <input
                    ref={refInput}
                    type="radio"
                    name="year"
                    value="All"
                    checked={model == null}
                    onChange={onYearChange}
                />{' '}
                All
            </label>
            <label>
                <input type="radio" name="year" value="2010" checked={!!model} onChange={onYearChange} /> Since 2010
            </label>
        </div>
    );
};
