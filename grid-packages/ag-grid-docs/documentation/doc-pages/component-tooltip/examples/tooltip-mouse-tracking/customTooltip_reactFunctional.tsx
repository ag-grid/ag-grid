import { ITooltipParams } from '@ag-grid-community/core';
import React, { useMemo } from 'react';

export default (props: ITooltipParams & { type: string }) => {

    const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex!)!.data, []);

    return (
        <div className={'panel panel-' + (props.type || 'primary')}>
            <div className="panel-heading">
                <h3 className="panel-title">{data.country}</h3>
            </div>
            <div className="panel-body">
                <h4 style={{ whiteSpace: 'nowrap' }}>{data.athlete}</h4>
                <p>Total: {data.total}</p>
            </div>
        </div>
    );
};
