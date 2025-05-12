import React, { forwardRef, useImperativeHandle, useState } from 'react';

import type { CustomStatusPanelProps } from 'ag-grid-react';

export default forwardRef((props: CustomStatusPanelProps, ref) => {
    const [visible, setVisible] = useState(true);
    const [text, setText] = useState('');

    const onClick = () => {
        setText(props.api.getSelectedRows().length + ' selected');
    };

    useImperativeHandle(ref, () => {
        return {
            setVisible: (visible: boolean) => {
                setVisible(visible);
            },
            isVisible: () => {
                return visible;
            },
        };
    });

    if (visible) {
        return (
            <div className="container">
                <div>
                    <span className="component">
                        Status Bar Component&nbsp;
                        <input type="button" onClick={() => onClick()} value="Click Me" />
                        <span> {text}</span>
                    </span>
                </div>
            </div>
        );
    }

    return null;
});
