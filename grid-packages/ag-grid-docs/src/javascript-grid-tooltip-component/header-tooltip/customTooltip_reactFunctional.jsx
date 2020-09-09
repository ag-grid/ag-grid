import React, {forwardRef, useImperativeHandle} from 'react';

export default forwardRef((props, ref) => {
    const isHeader = props.rowIndex === undefined;
    const isGroupedHeader = isHeader && !!props.colDef.children;
    const valueToDisplay = props.value.value ? props.value.value : '- Missing -';

    useImperativeHandle(ref, () => {
        return {
            getReactContainerClasses() {
                return ['custom-tooltip'];
            },
        };
    });

    return isHeader ?
        (
            <div className="custom-tooltip">
                <p>Group Name: {props.value}</p>
                {isGroupedHeader ? <hr/> : null}
                {isGroupedHeader ?
                    props.colDef.children.map(function (header, idx) {
                        return (
                            <p>Child {idx + 1} - {header.headerName}</p>
                        );
                    })
                    : null
                }
            </div>)
        :
        (
            <div className="custom-tooltip">
                <p><span>Athlete's Name:</span></p>
                <p><span>{valueToDisplay}</span></p>
            </div>
        );
});

