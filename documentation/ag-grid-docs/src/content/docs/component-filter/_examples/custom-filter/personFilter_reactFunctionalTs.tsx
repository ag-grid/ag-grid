import React, { useCallback, useRef } from 'react';

import type { IAfterGuiAttachedParams } from 'ag-grid-community';
import type { CustomFilterDisplayProps } from 'ag-grid-react';
import { useGridFilterDisplay } from 'ag-grid-react';

export default ({ model, onModelChange }: CustomFilterDisplayProps) => {
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

    return (
        <div className="person-filter">
            <div>Custom Athlete Filter</div>
            <div>
                <input
                    ref={refInput}
                    type="text"
                    value={model || ''}
                    onChange={({ target: { value } }) => onModelChange(value === '' ? null : value)}
                    placeholder="Full name search..."
                />
            </div>
            <div>
                This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.
            </div>
        </div>
    );
};
