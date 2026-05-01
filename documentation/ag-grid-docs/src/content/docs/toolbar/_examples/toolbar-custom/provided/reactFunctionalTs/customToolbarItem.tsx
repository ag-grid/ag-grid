import React, { useEffect, useState } from 'react';

import type { IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

const OPTIONS = [
    { value: 'filters-new', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
] as const;

export default (props: IToolbarItemParams) => {
    const { api, key } = props;
    const [opened, setOpened] = useState<string>('none');

    useEffect(() => {
        const handler = ({ key: panelKey, visible }: ToolPanelVisibleChangedEvent) => {
            setOpened((prev) => (visible ? panelKey : prev === panelKey ? 'none' : prev));
        };
        api.addEventListener('toolPanelVisibleChanged', handler);
        return () => api.removeEventListener('toolPanelVisibleChanged', handler);
    }, [api]);

    const onChange = (value: string) => {
        if (value === 'none') {
            api.closeToolPanel();
        } else {
            api.openToolPanel(value);
        }
    };

    return (
        <div className="ag-toolbar-item" role="radiogroup" aria-label="Tool panel">
            {OPTIONS.map((option) => (
                <label key={option.value} style={{ marginRight: 8 }}>
                    <input
                        type="radio"
                        name={`tool-panel-${key}`}
                        value={option.value}
                        checked={opened === option.value}
                        onChange={() => onChange(option.value)}
                        style={{ marginRight: 4 }}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
};
