import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import type { IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

interface PanelToggleParams {
    label: string;
    icon: string;
    panelId: string;
}

export interface PanelToggleHandle {
    toggle: () => void;
}

export default forwardRef<PanelToggleHandle, IToolbarItemParams<any, any, PanelToggleParams>>((props, ref) => {
    const { api } = props;
    const { label, icon, panelId } = props.toolbarItemParams!;
    const [active, setActive] = useState(false);

    const toggle = useCallback(() => {
        if (api.getOpenedToolPanel() === panelId) {
            api.closeToolPanel();
        } else {
            api.openToolPanel(panelId);
        }
    }, [api, panelId]);

    useImperativeHandle(ref, () => ({ toggle }), [toggle]);

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
            onClick={toggle}
            title={label}
            aria-label={label}
            style={active ? { backgroundColor: 'var(--ag-button-background-color)' } : undefined}
        >
            <span className={`ag-icon ag-icon-${icon}`} aria-hidden="true"></span>
            <span>{label}</span>
        </button>
    );
});
