import React, { forwardRef, Fragment, useImperativeHandle, useRef, useState } from 'react';
import { IFloatingFilterParams } from "@ag-grid-community/core";

export default forwardRef((props: IFloatingFilterParams<any>, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel: number | null) {
                // When the filter is empty we will receive a null value here
                if (parentModel == null) {
                    inputRef.current!.value = '';
                } else {
                    inputRef.current!.value = parentModel + '';
                }
            }
        }
    });


    const onInputBoxChanged = (input: any) => {
        const value = input.target.value;
        if (value === '') {
            // Remove the filter
            props.parentFilterInstance(instance => {
                instance.myMethodForTakingValueFromFloatingFilter(null);
            });
            return;
        }

        props.parentFilterInstance(instance => {
            instance.myMethodForTakingValueFromFloatingFilter(value);
        });
    }

    return (
        <Fragment>
            &gt; <input ref={inputRef} style={{ width: "30px" }} type="number" min="0" onInput={onInputBoxChanged} />
        </Fragment>
    );
});
