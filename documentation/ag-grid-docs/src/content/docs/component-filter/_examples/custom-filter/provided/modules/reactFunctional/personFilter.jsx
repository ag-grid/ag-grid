import React, { useCallback, useRef } from 'react';

import { useGridFilter } from 'ag-grid-react';

export default ({ model, onModelChange, getValue }) => {
    const refInput = useRef(null);

    const doesFilterPass = useCallback(
        (params) => {
            const { node } = params;
            const filterText = model;
            const value = getValue(node).toString().toLowerCase();
            // make sure each word passes separately, ie search for firstname, lastname
            return filterText
                .toLowerCase()
                .split(' ')
                .every((filterWord) => value.indexOf(filterWord) >= 0);
        },
        [model]
    );

    const afterGuiAttached = useCallback((params) => {
        if (!params || !params.suppressFocus) {
            // Focus the input element for keyboard navigation.
            // Can't do this in an effect,
            // as the component is not recreated when hidden and then shown again
            refInput.current.focus();
        }
    }, []);

    // register filter handlers with the grid
    useGridFilter({
        doesFilterPass,
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
