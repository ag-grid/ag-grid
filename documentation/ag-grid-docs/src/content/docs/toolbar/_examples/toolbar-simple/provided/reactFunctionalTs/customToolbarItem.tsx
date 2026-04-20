import React, { useCallback } from 'react';

import type { GridApi, IToolbarItemParams } from 'ag-grid-community';

interface CustomToolbarButtonProps extends IToolbarItemParams {
    label: string;
    onClick: (api: GridApi) => void;
}

export default (props: CustomToolbarButtonProps) => {
    const { api, label, onClick } = props;

    const handleClick = useCallback(() => {
        onClick(api);
    }, [api, onClick]);

    return (
        <button
            className="ag-toolbar-item ag-toolbar-button"
            type="button"
            onClick={handleClick}
            title={label}
            aria-label={label}
        >
            {label}
        </button>
    );
};
