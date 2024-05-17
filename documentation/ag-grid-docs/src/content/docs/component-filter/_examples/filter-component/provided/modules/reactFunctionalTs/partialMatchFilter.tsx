import { IDoesFilterPassParams } from '@ag-grid-community/core';
import { CustomFilterProps, useGridFilter } from '@ag-grid-community/react';
import React, { ChangeEvent, forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

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
