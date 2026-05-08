import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import type { FilterChangedEvent, IToolbarItemParams } from 'ag-grid-community';

const COLUMNS = [
    { column: 'gold', label: 'Gold winners only' },
    { column: 'silver', label: 'Silver winners only' },
];

export const WinnersToggle = (props: IToolbarItemParams) => {
    const { api } = props;
    const [checked, setChecked] = useState<Record<string, boolean>>({ gold: false, silver: false });

    useEffect(() => {
        const handler = (_event: FilterChangedEvent) => {
            const next: Record<string, boolean> = {};
            for (const { column } of COLUMNS) {
                next[column] = api.getColumnFilterModel(column) != null;
            }
            setChecked(next);
        };
        api.addEventListener('filterChanged', handler);
        return () => api.removeEventListener('filterChanged', handler);
    }, [api]);

    const onChange = (column: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const next = event.target.checked;
        const model = next ? { type: 'greaterThan', filter: 0 } : null;
        api.setColumnFilterModel(column, model).then(() => api.onFilterChanged());
    };

    return (
        <div className="ag-toolbar-item" style={{ display: 'flex', gap: 12, padding: 8 }}>
            {COLUMNS.map(({ column, label }) => (
                <label key={column} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
                    <input
                        type="checkbox"
                        checked={checked[column] ?? false}
                        onChange={(event) => onChange(column, event)}
                        style={{ margin: 0 }}
                    />
                    {label}
                </label>
            ))}
        </div>
    );
};

const PANELS = [
    { value: 'filters', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
];

export interface ToolPanelRadioHandle {
    setSelected(value: string): void;
}

export const ToolPanelRadio = forwardRef<ToolPanelRadioHandle, IToolbarItemParams>((props, ref) => {
    const { api, key } = props;
    const [selected, setSelected] = useState('none');

    useImperativeHandle(ref, () => ({ setSelected }), []);

    const onChange = (value: string) => {
        setSelected(value);
        if (value === 'none') {
            api.closeToolPanel();
        } else {
            api.openToolPanel(value);
        }
    };

    return (
        <div
            className="ag-toolbar-item"
            role="radiogroup"
            style={{ display: 'flex', gap: 12, padding: 10, alignItems: 'center' }}
        >
            <span style={{ fontWeight: 500 }}>Tool Panel:</span>
            {PANELS.map(({ value, label }) => (
                <label key={value} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
                    <input
                        type="radio"
                        name={`tool-panel-${key}`}
                        value={value}
                        checked={selected === value}
                        onChange={() => onChange(value)}
                        style={{ margin: 0 }}
                    />
                    {label}
                </label>
            ))}
        </div>
    );
});
