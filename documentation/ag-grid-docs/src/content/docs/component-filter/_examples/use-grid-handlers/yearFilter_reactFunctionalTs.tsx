import type { ChangeEvent } from 'react';
import React, { useCallback, useRef } from 'react';

import type {
    FilterWrapperParams,
    IAfterGuiAttachedParams,
    ISimpleFilterModelType,
    NumberFilterModel,
} from 'ag-grid-community';
import type { CustomFilterDisplayProps } from 'ag-grid-react';
import { useGridFilterDisplay } from 'ag-grid-react';

export default ({
    state,
    onStateChange,
    onAction,
    buttons,
}: CustomFilterDisplayProps<any, any, NumberFilterModel> & FilterWrapperParams) => {
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
        onStateChange({
            model:
                value === 'All'
                    ? null
                    : {
                          type: value as ISimpleFilterModelType,
                          filterType: 'number',
                          filter: 2010,
                      },
        });
        if (!buttons?.includes('apply')) {
            onAction('apply');
        }
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
                    checked={state.model == null}
                    onChange={onYearChange}
                />{' '}
                All
            </label>
            <label>
                <input
                    type="radio"
                    name="year"
                    value="lessThan"
                    checked={state.model?.type === 'lessThan'}
                    onChange={onYearChange}
                />{' '}
                Before 2010
            </label>
            <label>
                <input
                    type="radio"
                    name="year"
                    value="greaterThan"
                    checked={state.model?.type === 'greaterThan'}
                    onChange={onYearChange}
                />{' '}
                Since 2010
            </label>
        </div>
    );
};
