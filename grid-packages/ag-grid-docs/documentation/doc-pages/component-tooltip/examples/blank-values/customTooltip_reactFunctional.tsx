import React, { useMemo } from 'react';
import { CustomTooltipProps } from '@ag-grid-community/react'

export default (props: CustomTooltipProps) => {

    const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex!)!.data, []);

    const valueToDisplay = props.value.value ? props.value.value : '- Missing -';
    return (
        <div className="custom-tooltip">
            <p><span>Athlete's Name:</span></p>
            <p><span>{valueToDisplay}</span></p>
        </div>
    );
};
