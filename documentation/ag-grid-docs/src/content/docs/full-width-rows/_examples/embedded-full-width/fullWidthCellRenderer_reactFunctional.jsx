import React, { useState } from 'react';

export default (props) => {
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
