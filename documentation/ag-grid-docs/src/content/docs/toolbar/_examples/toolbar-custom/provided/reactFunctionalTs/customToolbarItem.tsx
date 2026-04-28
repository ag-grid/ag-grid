import React, { useEffect, useState } from 'react';

import type { GridApi, IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

interface CustomToolbarToggleProps extends IToolbarItemParams {
    label?: string;
    title?: string;
    icon: string;
    panelId: string;
    onClick: (api: GridApi) => void;
}

export default (props: CustomToolbarToggleProps) => {
    const { api, label, title, icon, panelId, onClick } = props;
    const [active, setActive] = useState(false);
    const tooltip = title ?? label ?? '';

    useEffect(() => {
        const handler = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
            if (key === panelId) {
                setActive(visible);
            } else if (visible) {
                setActive(false);
            }
        };
        api.addEventListener('toolPanelVisibleChanged', handler);
        return () => api.removeEventListener('toolPanelVisibleChanged', handler);
    }, [api, panelId]);

    return (
        <button
            className="ag-toolbar-item ag-toolbar-button"
            type="button"
            onClick={() => onClick(api)}
            title={tooltip}
            aria-label={tooltip}
            style={active ? { backgroundColor: 'var(--ag-button-background-color)' } : undefined}
        >
            <span className={`ag-icon ag-icon-${icon}`} aria-hidden="true"></span>
            {label && <span>{label}</span>}
        </button>
    );
};
