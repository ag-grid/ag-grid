import React, { useEffect, useState } from 'react';

import type { IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

export default (props: IToolbarItemParams) => {
    const { api } = props;
    const { label, title, icon, panelId, onClick } = props.toolbarItemParams;
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
