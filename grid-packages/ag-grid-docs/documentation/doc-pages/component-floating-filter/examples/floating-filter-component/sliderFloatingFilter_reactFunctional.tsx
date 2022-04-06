import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { IFloatingFilterParams, NumberFilterModel } from "@ag-grid-community/core";

export interface SliderFloatingFilterParams extends IFloatingFilterParams {
    value: number;
    maxValue: number;
}

export default forwardRef((props: SliderFloatingFilterParams, ref) => {
    const [currentValue, setCurrentValue] = useState<number>(0);

    useEffect(() => {
        let valueToUse = currentValue === 0 ? null : currentValue;
        props.parentFilterInstance(instance => instance.onFloatingFilterChanged('greaterThan', valueToUse));
    }, [currentValue]);

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
    };

    const style = {
        border: '2px solid #22ff22',
        borderRadius: '5px',
        backgroundColor: '#bbffbb',
        width: '200px',
        height: '50px'
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

