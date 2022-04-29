import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { IFloatingFilterParams, NumberFilterModel } from "@ag-grid-community/core";

export interface SliderFloatingFilterParams extends IFloatingFilterParams {
    value: number;
    maxValue: number;
}

export default forwardRef((props: SliderFloatingFilterParams, ref) => {
    const [currentValue, setCurrentValue] = useState<number>(0);

    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel: NumberFilterModel) {
                // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
                // so just read off the value and use that
                setCurrentValue(!parentModel ? 0 : parentModel.filter!);
            }
        };
    });

    const valueChanged = (event: any) => {
        setCurrentValue(event.target.value);
        let valueForMainFilter = (event.target.value === "0") ? null : event.target.value;
        props.parentFilterInstance(instance => {
            instance.onFloatingFilterChanged('greaterThan', valueForMainFilter);
        });
    };

    return (
        <input type="range"
            value={currentValue}
            min={0}
            max={props.maxValue}
            step={1}
            onChange={valueChanged} />
    );
});

