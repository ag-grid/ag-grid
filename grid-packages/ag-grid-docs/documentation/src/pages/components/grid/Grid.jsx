import React, { forwardRef } from "react"
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model"
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail"
import { SetFilterModule } from "@ag-grid-enterprise/set-filter"
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel"
import { StatusBarModule } from "@ag-grid-enterprise/status-bar"
import { AgGridReact } from "@ag-grid-community/react"

import "@ag-grid-community/styles/ag-grid.css"
import "@ag-grid-community/styles/ag-theme-alpine.css"

const Grid = forwardRef((props, ref) => {
    return (
        <div
            className="ag-theme-alpine"
            style={{ width: "100%", height: props.gridHeight }}
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
                            statusPanel: "agTotalAndFilteredRowCountComponent",
                            align: "left",
                        },
                        {
                            statusPanel: "agTotalRowCountComponent",
                            align: "center",
                        },
                        { statusPanel: "agFilteredRowCountComponent" },
                        { statusPanel: "agSelectedRowCountComponent" },
                        { statusPanel: "agAggregationComponent" },
                    ],
                }}
            ></AgGridReact>
        </div>
    )
})

export default Grid
