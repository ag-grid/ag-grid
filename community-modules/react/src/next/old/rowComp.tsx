import {CellSt, RowSt} from "@ag-grid-community/core";
import {CellComp} from "./cellComp";
import React from "react";

export function RowComp(props: {row: RowSt}) {
    const {row} = props;

    const evenOddClass = row.index % 2 === 0 ? 'ag-row-even' : 'ag-row-odd';

    return (
        <div className={`ag-row ag-row-no-focus ${evenOddClass} ag-row-level-0 ag-row-position-absolute`}  role="row" row-index="999"
             row-id="999" row-business-key="999"
             style={{
                 height: row.height + 'px',
                 top: row.top + 'px'
             }}>
            { props.row.cells.map( (cell: CellSt) => <CellComp key={cell.colId} cell={cell}></CellComp>) }
        </div>
    );
}