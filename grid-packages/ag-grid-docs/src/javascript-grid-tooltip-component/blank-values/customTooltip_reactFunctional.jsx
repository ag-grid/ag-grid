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

    const valueToDisplay = props.value.value ? props.value.value : '- Missing -';
    return (
        <div className="custom-tooltip">
            <p><span>Athlete's Name:</span></p>
            <p><span>{valueToDisplay}</span></p>
        </div>
    );
});

