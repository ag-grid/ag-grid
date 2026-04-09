import React, { useCallback, useState } from 'react';

import type { IToolbarItemParams } from 'ag-grid-community';

export default (props: IToolbarItemParams) => {
    const [active, setActive] = useState(false);

    const onClick = useCallback(() => {
        const { api } = props;
        const next = !active;
        setActive(next);

        if (next) {
            api.setRowGroupColumns(['country']);
            api.setFilterModel({ year: { filterType: 'number', type: 'equals', filter: 2008 } });
        } else {
            api.setRowGroupColumns([]);
            api.setFilterModel(null);
        }
    }, [active, props]);

    return (
        <div className="ag-toolbar-item">
            <button className="ag-button ag-standard-button" onClick={onClick}>
                {active ? 'Clear Analysis' : 'Analyse by Country'}
            </button>
        </div>
    );
};
