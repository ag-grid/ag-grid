import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import type { IAfterGuiAttachedParams } from 'ag-grid-community';
import type { CustomFilterDisplayProps } from 'ag-grid-react';
import { useGridFilterDisplay } from 'ag-grid-react';

export default forwardRef(({ model, onModelChange }: CustomFilterDisplayProps, ref) => {
    const refInput = useRef<HTMLInputElement>(null);

    const afterGuiAttached = useCallback((params?: IAfterGuiAttachedParams) => {
        if (!params || !params.suppressFocus) {
            // Focus the input element for keyboard navigation.
            // Can't do this in an effect,
            // as the component is not recreated when hidden and then shown again
            if (refInput.current) {
                refInput.current.focus();
            } else {
                setTimeout(() => {
                    refInput.current?.focus();
                });
            }
        }
    }, []);

    // register filter handlers with the grid
    useGridFilterDisplay({
        afterGuiAttached,
    });

    useImperativeHandle(ref, () => {
        return {
            componentMethod(message: string) {
                console.log(`Alert from PartialMatchFilterComponent: ${message}`);
            },
        };
    });

    return (
        <div className="partial-match-filter">
            <div>Partial Match Filter</div>
            <div>
                <input
                    ref={refInput}
                    type="text"
                    value={model || ''}
                    onChange={({ target: { value } }) => onModelChange(value === '' ? null : value)}
                />
            </div>
        </div>
    );
});
