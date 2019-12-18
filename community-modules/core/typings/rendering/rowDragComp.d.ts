import { Component } from "../widgets/component";
import { RowNode } from "../entities/rowNode";
import { Beans } from "./beans";
import { Column } from "../entities/column";
export declare class RowDragComp extends Component {
    private readonly beans;
    private readonly rowNode;
    private readonly column;
    private readonly cellValue;
    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans);
    private postConstruct;
    private checkCompatibility;
    private addDragSource;
}
