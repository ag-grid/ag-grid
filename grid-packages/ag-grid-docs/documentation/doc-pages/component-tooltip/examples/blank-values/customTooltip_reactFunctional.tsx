import React, { useMemo } from 'react';
import { ITooltipParams } from '@ag-grid-community/core'

export default (props: ITooltipParams) => {

    const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex!)!.data, []);

    const valueToDisplay = props.value.value ? props.value.value : '- Missing -';
    return (
        <div className="custom-tooltip">
            <p><span>Athlete's Name:</span></p>
            <p><span>{valueToDisplay}</span></p>
        </div>
    );
};
