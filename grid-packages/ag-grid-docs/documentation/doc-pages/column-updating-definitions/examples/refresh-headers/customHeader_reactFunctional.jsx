import React, { useRef } from 'react';

const CustomHeader = ({ enableMenu, displayName, showColumnMenu }) => {
    const menuButtonRef = useRef();

    console.log('CustomHeader rendered -> ' + displayName);

    return (
        <div style={{ display: 'flex' }}>
            {enableMenu && <div
                ref={menuButtonRef}
                className="ag-icon ag-icon-menu"
                onClick={() => showColumnMenu(menuButtonRef.current)}>&nbsp;</div>}
            <div className="customHeaderLabel">{displayName}</div>
        </div>
    );
};

export default CustomHeader;