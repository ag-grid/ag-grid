import React, {forwardRef, Fragment, useImperativeHandle, useRef, useState} from 'react';

export default forwardRef((props, ref) => {
    const [currentValue, setCurrentValue] = useState(null);
    const inputRef = useRef(null);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel) {
                // When the filter is empty we will receive a null value here
                if (!parentModel) {
                    inputRef.current.value = '';
                    setCurrentValue(null);
                } else {
                    inputRef.current.value = parentModel.filter + '';
                    setCurrentValue(parentModel.filter);
                }
            }

        }
    });


    const onInputBoxChanged = input => {
        if (input.target.value === '') {
            // Remove the filter
            props.parentFilterInstance(instance => {
                instance.onFloatingFilterChanged(null, null);
            });
            return;
        }

        setCurrentValue(Number(input.target.value));
        props.parentFilterInstance(instance => {
            instance.onFloatingFilterChanged('greaterThan', input.target.value);
        });
    }

    const style = {
        color: props.color,
        width: "30px"
    };

    return (
        <Fragment>
            &gt; <input ref={inputRef} style={style} type="number" min="0" onInput={onInputBoxChanged}/>
        </Fragment>
    );
});
