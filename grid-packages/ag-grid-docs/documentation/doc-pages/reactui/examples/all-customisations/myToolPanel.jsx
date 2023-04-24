import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export default forwardRef((props, ref) => {
 
    const [value, setValue] = useState(0);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            sampleToolPanelMethod() {
                setValue( value => value + 1);
            }
        }
    });

    return (
        <div className='my-tool-panel'>
            <div>
                Sample Tool Panel
            </div>
            <div className='my-tool-panel-value'>
                {value}
            </div>
        </div>
    )
});
