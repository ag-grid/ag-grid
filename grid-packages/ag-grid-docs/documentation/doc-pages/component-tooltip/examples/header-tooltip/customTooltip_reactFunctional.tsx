import React from 'react';
import { ColGroupDef, ITooltipParams } from '@ag-grid-community/core'

export default (props: ITooltipParams) => {
    const isHeader = props.rowIndex === undefined;
    const isGroupedHeader = isHeader && !!(props.colDef as ColGroupDef).children;
    const valueToDisplay = props.value.value ? props.value.value : '- Missing -';

    return isHeader ?
        (
            <div className="custom-tooltip">
                <p>Group Name: {props.value}</p>
                {isGroupedHeader ? <hr /> : null}
                {isGroupedHeader ?
                    (props.colDef as ColGroupDef).children.map(function (header, idx) {
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
};

