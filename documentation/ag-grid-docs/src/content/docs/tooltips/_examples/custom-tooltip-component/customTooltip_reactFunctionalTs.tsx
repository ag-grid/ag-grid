import { CustomTooltipProps } from '@ag-grid-community/react';
import React, { useMemo } from 'react';

export default (props: CustomTooltipProps & { color: string }) => {
    return (
        <div className="custom-tooltip" style={{ backgroundColor: props.color || '#999' }}>
            <div>
                <b>Custom Tooltip</b>
            </div>
            <div>{props.value}</div>
        </div>
    );
};
