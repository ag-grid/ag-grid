import { IFloatingFilterParams, NumberFilterModel } from '@ag-grid-community/core';
import React, { Fragment, forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface CustomParams extends IFloatingFilterParams {
    color: string;
}

export default forwardRef((props: CustomParams, ref) => {
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel: NumberFilterModel) {
                // When the filter is empty we will receive a null value here
                if (!parentModel) {
                    inputRef.current!.value = '';
                    setCurrentValue(null);
                } else {
                    inputRef.current!.value = parentModel.filter + '';
                    setCurrentValue(parentModel.filter!);
                }
            },
        };
    });

    const onInputBoxChanged = (input: any) => {
        if (input.target.value === '') {
            // Remove the filter
            props.parentFilterInstance((instance) => {
                instance.onFloatingFilterChanged(null, null);
            });
            return;
        }

        setCurrentValue(Number(input.target.value));
        props.parentFilterInstance((instance) => {
            instance.onFloatingFilterChanged('greaterThan', input.target.value);
        });
    };

    const style = {
        borderColor: props.color,
        width: '30px',
    };

    return (
        <Fragment>
            &gt; <input ref={inputRef} style={style} type="number" min="0" onInput={onInputBoxChanged} />
        </Fragment>
    );
});
