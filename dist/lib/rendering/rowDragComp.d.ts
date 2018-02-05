// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../widgets/component";
import { RowNode } from "../entities/rowNode";
import { Beans } from "./beans";
import { Column } from "../entities/column";
export declare class RowDragComp extends Component {
    private beans;
    private rowNode;
    private column;
    private cellValue;
    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans);
    private postConstruct();
    private checkCompatibility();
    private addDragSource();
}
