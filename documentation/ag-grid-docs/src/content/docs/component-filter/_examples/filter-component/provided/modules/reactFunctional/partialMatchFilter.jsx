import { useGridFilter } from '@ag-grid-community/react';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export default forwardRef(({ model, onModelChange, getValue }, ref) => {
    const refInput = useRef(null);

    const doesFilterPass = useCallback(
        ({ node }) => {
            const value = getValue(node).toString().toLowerCase();

            return model.value
                .toLowerCase()
                .split(' ')
                .every((filterWord) => value.indexOf(filterWord) >= 0);
        },
        [model]
    );

    const afterGuiAttached = useCallback((params) => {
        window.setTimeout(() => {
            refInput.current.focus();
        });
    }, []);

    useGridFilter({
        doesFilterPass,
        afterGuiAttached,
    });

    useImperativeHandle(ref, () => {
        return {
            componentMethod(message) {
                alert(`Alert from PartialMatchFilterComponent: ${message}`);
            },
        };
    });

    const onChange = ({ target: { value } }) => {
        onModelChange({ value });
    };

    const style = {
        borderRadius: '5px',
        width: '200px',
        height: '50px',
        padding: '10px',
    };

    return (
        <div style={style}>
            Partial Match Filter:
            <input
                style={{ height: '20px' }}
                ref={refInput}
                value={model == null ? '' : model.value}
                onChange={onChange}
                className="form-control"
            />
        </div>
    );
});
