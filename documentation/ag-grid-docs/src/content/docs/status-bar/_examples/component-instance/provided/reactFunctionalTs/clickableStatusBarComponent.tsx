import React, { forwardRef, useImperativeHandle, useState } from 'react';

import type { CustomStatusPanelProps } from 'ag-grid-react';

export default forwardRef((props: CustomStatusPanelProps, ref) => {
    const [visible, setVisible] = useState(true);

    const onClick = () => {
        alert('Selected Row Count: ' + props.api.getSelectedRows().length);
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
                    </span>
                </div>
            </div>
        );
    }

    return null;
});
