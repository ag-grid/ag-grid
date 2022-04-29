import React, { forwardRef, useImperativeHandle, useState } from 'react';

export default forwardRef((props, ref) => {
    const [currentValue, setCurrentValue] = useState(0);

    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel) {
                // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
                // so just read off the value and use that
                setCurrentValue(!parentModel ? 0 : parentModel.filter);
            }
        };
    });

    const valueChanged = event => {
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

