import React, { useEffect, useMemo, useRef, useState } from "react";
import { Context,  _, RowNode, Column, RowCtrl } from "ag-grid-community";
import { CssClasses } from "./utils";

export function CellComp(props: {column: Column, rowCtrl: RowCtrl, context: Context}) {

    const {column, rowCtrl, context} = props;
    const colDef = column.getColDef();

    const rowNode = useMemo( ()=> rowCtrl.getRowNode(), []);

    const value = (colDef.field && rowNode.data) ? rowNode.data[colDef.field] : '';

    return (<span>{value}</span>)
}