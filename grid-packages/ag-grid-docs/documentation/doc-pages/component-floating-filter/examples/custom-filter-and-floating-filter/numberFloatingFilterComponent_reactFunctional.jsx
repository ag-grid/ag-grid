import React, {forwardRef, Fragment, useImperativeHandle, useRef, useState} from 'react';

export default forwardRef((props, ref) => {
    const inputRef = useRef(null);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel) {
                // When the filter is empty we will receive a null value here
                if (parentModel == null) {
                    inputRef.current.value = '';
                } else {
                    inputRef.current.value = parentModel;
                }
            }
        }
    });


    const onInputBoxChanged = input => {
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
            &gt; <input ref={inputRef} style={{width: "30px"}} type="number" min="0" onInput={onInputBoxChanged}/>
        </Fragment>
    );
});
