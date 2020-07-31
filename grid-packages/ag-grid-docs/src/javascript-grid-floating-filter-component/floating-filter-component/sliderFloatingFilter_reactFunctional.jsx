import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';

export default forwardRef((props, ref) => {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        let valueToUse = (currentValue === "0") ? null : currentValue;
        props.parentFilterInstance(instance => instance.onFloatingFilterChanged('greaterThan', valueToUse));
    }, [currentValue]);

    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel) {
                // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
                // so just read off the value and use that
                setCurrentValue(!parentModel ? 0 : parentModel.filter);
            }
        }
    });

    const valueChanged = event => {
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
               onChange={valueChanged}/>
    );
});

