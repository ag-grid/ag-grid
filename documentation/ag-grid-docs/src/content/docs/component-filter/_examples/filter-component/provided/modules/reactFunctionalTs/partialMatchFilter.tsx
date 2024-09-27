import type { ChangeEvent } from 'react';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import type { IDoesFilterPassParams } from 'ag-grid-community';
import type { CustomFilterProps } from 'ag-grid-react';
import { useGridFilter } from 'ag-grid-react';

export default forwardRef(({ model, onModelChange, getValue }: CustomFilterProps<any, any, { value: string }>, ref) => {
    const refInput = useRef<HTMLInputElement>(null);

    const doesFilterPass = useCallback(
        ({ node }: IDoesFilterPassParams) => {
            const value = getValue(node).toString().toLowerCase();

            return model!.value
                .toLowerCase()
                .split(' ')
                .every((filterWord) => value.indexOf(filterWord) >= 0);
        },
        [model]
    );

    const afterGuiAttached = useCallback(() => {
        window.setTimeout(() => {
            refInput.current?.focus();
        });
    }, []);

    useGridFilter({
        doesFilterPass,
        afterGuiAttached,
    });

    useImperativeHandle(ref, () => {
        return {
            componentMethod(message: string) {
                alert(`Alert from PartialMatchFilterComponent: ${message}`);
            },
        };
    });

    const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
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
