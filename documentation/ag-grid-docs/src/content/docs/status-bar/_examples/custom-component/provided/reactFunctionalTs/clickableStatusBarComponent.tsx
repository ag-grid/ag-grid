import React from 'react';

import type { CustomStatusPanelProps } from 'ag-grid-react';

export default (props: CustomStatusPanelProps) => {
    const [text, setText] = React.useState('');

    const onClick = () => {
        setText(props.api.getSelectedRows().length + ' selected');
    };

    return (
        <div className="ag-status-name-value">
            <span>
                Status Bar Component&nbsp;
                <input type="button" className="status-bar-input" onClick={() => onClick()} value="Click Me" />
                <span> {text}</span>
            </span>
        </div>
    );
};
