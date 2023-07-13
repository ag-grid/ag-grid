import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import React, { forwardRef } from 'react';

const Grid = forwardRef((props, ref) => {
    return (
        <div
            className={props.theme ? props.theme : 'ag-theme-alpine'}
            style={{ width: '100%', height: props.gridHeight }}
        >
            <AgGridReact
                ref={ref}
                {...props}
                modules={[
                    ClientSideRowModelModule,
                    MasterDetailModule,
                    SetFilterModule,
                    ColumnsToolPanelModule,
                    StatusBarModule,
                ]}
                statusBar={{
                    statusPanels: [
                        {
                            statusPanel: 'agTotalAndFilteredRowCountComponent',
                            align: 'left',
                        },
                        {
                            statusPanel: 'agTotalRowCountComponent',
                            align: 'center',
                        },
                        { statusPanel: 'agFilteredRowCountComponent' },
                        { statusPanel: 'agSelectedRowCountComponent' },
                        { statusPanel: 'agAggregationComponent' },
                    ],
                }}
            />
        </div>
    );
});

export default Grid;
