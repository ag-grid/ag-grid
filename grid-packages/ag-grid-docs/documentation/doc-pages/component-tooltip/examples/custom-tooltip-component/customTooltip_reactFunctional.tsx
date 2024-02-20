import React, { useMemo } from 'react';
import { CustomTooltipProps } from '@ag-grid-community/react';
export default (props: CustomTooltipProps & { color: string }) => {
    const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex!)!.data, []);

    return (
        <div className="custom-tooltip" style={{ backgroundColor: props.color || '#999' }}>
            <p><span>{data.athlete}</span></p>
            <p><span>Country: </span> {data.country}</p>
            <p><span>Total: </span> {data.total}</p>
        </div>
    );
};

