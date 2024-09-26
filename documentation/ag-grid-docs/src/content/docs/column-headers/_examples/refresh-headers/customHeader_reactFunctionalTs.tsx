import React, { useRef } from 'react';

import type { CustomHeaderProps } from 'ag-grid-react';

const CustomHeader = (props: CustomHeaderProps) => {
    const { enableFilterButton, displayName, showColumnMenu } = props;
    const menuButtonRef = useRef(null);

    console.log('CustomHeader rendered -> ' + displayName);

    return (
        <div style={{ display: 'flex' }}>
            {enableFilterButton && (
                <div
                    ref={menuButtonRef}
                    className="ag-icon ag-icon-menu"
                    onClick={() => showColumnMenu(menuButtonRef.current!)}
                >
                    &nbsp;
                </div>
            )}
            <div className="customHeaderLabel">{displayName}</div>
        </div>
    );
};

export default CustomHeader;
