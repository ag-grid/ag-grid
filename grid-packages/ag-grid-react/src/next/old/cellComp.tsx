import {CellSt} from "ag-grid-community";
import React from "react";

export function CellComp(props: {cell: CellSt}) {
    const {cell} = props;

    return (
        <div role="gridcell" aria-colindex={cell.colId} col-id={cell.colId}
                className="ag-cell ag-cell-not-inline-editing ag-cell-auto-height alphabet ag-cell-value"
                style={{
                    width: cell.width,
                    left: cell.left
                }}>
            {props.cell.value}
        </div>
    );
}
