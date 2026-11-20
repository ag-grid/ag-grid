import React from 'react';

import type { CustomBuiltInTooltipProps } from 'ag-grid-react';

export default (props: CustomBuiltInTooltipProps & { heading: string }) => (
    <div className="control-tooltip">
        <span>{props.heading}</span>
        <strong>{props.text}</strong>
        <small>
            {props.location} / {props.control}
        </small>
    </div>
);
