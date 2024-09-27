import React, { useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const [cssClass] = useState(props.pinned ? 'example-full-width-pinned' : 'example-full-width-row');
    const [message] = useState(
        props.pinned
            ? `Pinned full width on ${props.pinned} - index ${props.node.rowIndex}`
            : `Non pinned full width row at index ${props.node.rowIndex}`
    );

    return (
        <div className={cssClass}>
            <button onClick={() => alert('button clicked')}>Click</button>
            {message}
        </div>
    );
};
