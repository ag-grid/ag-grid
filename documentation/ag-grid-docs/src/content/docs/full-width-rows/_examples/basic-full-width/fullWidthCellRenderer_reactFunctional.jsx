import React, { useState } from 'react';

export default (props) => {
    const [cssClass] = useState(props.node.rowPinned ? 'example-full-width-pinned-row' : 'example-full-width-row');
    const [message] = useState(
        props.node.rowPinned
            ? `Pinned full width row at index ${props.node.rowIndex}`
            : `Normal full width row at index ${props.node.rowIndex}`
    );

    return (
        <div className={cssClass}>
            <button onClick={() => alert('button clicked')}>Click</button>
            {message}
        </div>
    );
};
