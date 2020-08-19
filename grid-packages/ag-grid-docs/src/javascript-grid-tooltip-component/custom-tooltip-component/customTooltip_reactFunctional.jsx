import React, {forwardRef, useImperativeHandle, useState} from 'react';

export default forwardRef((props, ref) => {
    const [data, setData] = useState(props.api.getDisplayedRowAtIndex(props.rowIndex).data);

    useImperativeHandle(ref, () => {
        return {
            getReactContainerClasses() {
                return ['custom-tooltip'];
            }
        }
    });

    return (
        <div className="custom-tooltip" style={{backgroundColor: props.color || 'white'}}>
            <p><span>{data.athlete}</span></p>
            <p><span>Country: </span> {data.country}</p>
            <p><span>Total: </span> {data.total}</p>
        </div>
    );
});

