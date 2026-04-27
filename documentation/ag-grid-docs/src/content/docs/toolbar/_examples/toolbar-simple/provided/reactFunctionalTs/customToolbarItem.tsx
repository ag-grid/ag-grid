import React, { useCallback } from 'react';

import type { GridApi, IToolbarItemParams } from 'ag-grid-community';

interface CustomToolbarButtonProps extends IToolbarItemParams {
    label?: string;
    title?: string;
    icon: string;
    onClick: (api: GridApi) => void;
}

export default (props: CustomToolbarButtonProps) => {
    const { api, label, title, icon, onClick } = props;
    const tooltip = title ?? label ?? '';

    const handleClick = useCallback(() => {
        onClick(api);
    }, [api, onClick]);

    return (
        <button
            className="ag-toolbar-item ag-toolbar-button"
            type="button"
            onClick={handleClick}
            title={tooltip}
            aria-label={tooltip}
        >
            <span className={`ag-icon ag-icon-${icon}`} aria-hidden="true"></span>
            {label && <span>{label}</span>}
        </button>
    );
};
