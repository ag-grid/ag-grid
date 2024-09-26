import React, { useMemo } from 'react';

import type { CustomTooltipProps } from 'ag-grid-react';

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
