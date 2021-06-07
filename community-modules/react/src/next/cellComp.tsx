import React, { useEffect, useRef, useState } from "react";
import { Context, IRowComp, RowCtrl, _, RowNode, Column } from "@ag-grid-community/core";
import { CssClasses } from "./utils";

export function CellComp(props: {column: Column, rowNode: RowNode, context: Context}) {
    return (<span></span>)
}