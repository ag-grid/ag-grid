import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export default forwardRef((props, ref) => {
 
    const [value, setValue] = useState(0);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            sampleStatusPanelMethod() {
                setValue( value => value + 1);
            }
        }
    });

    return (
        <div className='my-status-panel'>
            <span>
                Sample Status Panel
            </span>
            <span className='my-status-panel-value'>
                {value}
            </span>
        </div>
    )
});