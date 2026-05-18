import React, { useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const {
        pinned,
        node: { rowIndex },
    } = props;

    const [cssClass] = useState(() => (pinned ? 'example-full-width-pinned' : 'example-full-width-row'));
    const [message] = useState(() =>
        pinned ? `Pinned full width on ${pinned} - index ${rowIndex}` : `Non pinned full width row at index ${rowIndex}`
    );

    if ((pinned === 'left' && rowIndex! % 4 === 0) || (pinned === 'right' && rowIndex! % 2 === 0)) {
        return null;
    }

    return (
        <div className={cssClass}>
            <button onClick={() => console.log('button clicked')}>Click</button>
            {message}
        </div>
    );
};
