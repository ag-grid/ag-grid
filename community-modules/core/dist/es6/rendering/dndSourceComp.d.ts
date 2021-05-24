// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../widgets/component";
import { RowNode } from "../entities/rowNode";
import { Beans } from "./beans";
import { Column } from "../entities/column";
export declare class DndSourceComp extends Component {
    private readonly beans;
    private readonly rowNode;
    private readonly column;
    private readonly eCell;
    constructor(rowNode: RowNode, column: Column, beans: Beans, eCell: HTMLElement);
    private postConstruct;
    private addDragSource;
    private onDragStart;
    private checkVisibility;
}
