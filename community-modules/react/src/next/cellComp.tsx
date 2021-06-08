import React, { useEffect, useRef, useState } from "react";
import { Context,  _, RowNode, Column } from "@ag-grid-community/core";
import { CssClasses } from "./utils";

export function CellComp(props: {column: Column, rowNode: RowNode, context: Context}) {

    const {column, rowNode, context} = props;
    const colDef = column.getColDef();
    const value = (colDef.field && rowNode.data) ? rowNode.data[colDef.field] : '';

    return (<span>{value}</span>)
}