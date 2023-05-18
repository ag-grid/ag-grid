import React, { useState } from 'react';

import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams) => {
    const [cssClass] = useState(props.pinned ? 'example-full-width-pinned' :
        'example-full-width-row');
    const [message] = useState(props.pinned ? `Pinned full width on ${props.pinned} - index ${props.rowIndex}` :
        `Non pinned full width row at index${props.rowIndex}`);

    return (
        <div className={cssClass}>
            <button onClick={() => alert('button clicked')}>Click</button>
            {message}
        </div>)
}
