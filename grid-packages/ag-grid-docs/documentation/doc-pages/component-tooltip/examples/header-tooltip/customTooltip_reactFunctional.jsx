import React from 'react';

export default props => {
    const isHeader = props.rowIndex === undefined;
    const isGroupedHeader = isHeader && !!props.colDef.children;
    const valueToDisplay = props.value.value ? props.value.value : '- Missing -';

    return isHeader ?
        (
            <div className="custom-tooltip custom-tooltip-grouped">
                <span>Group Name: {props.value}</span>
                {isGroupedHeader ?
                    props.colDef.children.map(function (header, idx) {
                        return (
                            <span key={idx}>Child {idx + 1} - {header.headerName}</span>
                        );
                    })
                    : null
                }
            </div>)
        :
        (
            <div className="custom-tooltip">
                <span>Athlete's Name:</span>
                <span>{valueToDisplay}</span>
            </div>
        );
};

