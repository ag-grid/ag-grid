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
        <div className={'panel panel-' + (props.type || 'primary') }>
            <div className="panel-heading">
                <h3 className="panel-title">{data.country}</h3>
            </div>
            <div className="panel-body">
                <h4 style={{whiteSpace: 'nowrap'}}>{data.athlete}</h4>
                <p>Total: {data.total}</p>
            </div>
        </div>
    );
});

