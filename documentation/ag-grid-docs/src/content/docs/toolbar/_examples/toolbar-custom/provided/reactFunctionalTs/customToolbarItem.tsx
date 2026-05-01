import React, { useEffect, useState } from 'react';

import type { FilterChangedEvent, IToolbarItemParams } from 'ag-grid-community';

const COLUMNS = [
    { column: 'gold', label: 'Gold winners only' },
    { column: 'silver', label: 'Silver winners only' },
];

export default (props: IToolbarItemParams) => {
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
                <label key={column} style={{ padding: '0 4px' }}>
                    <input
                        type="checkbox"
                        checked={checked[column] ?? false}
                        onChange={(event) => onChange(column, event)}
                        style={{ marginRight: 4 }}
                    />
                    {label}
                </label>
            ))}
        </div>
    );
};
