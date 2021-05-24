// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
import { ColumnGroup } from "../../entities/columnGroup";
import { ColumnApi } from "../../columnController/columnApi";
import { GridApi } from "../../gridApi";
export interface IHeaderGroupParams {
    columnGroup: ColumnGroup;
    displayName: string;
    setExpanded: (expanded: boolean) => void;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
export interface IHeaderGroup {
}
export interface IHeaderGroupComp extends IHeaderGroup, IComponent<IHeaderGroupParams> {
}
export declare class HeaderGroupComp extends Component implements IHeaderGroupComp {
    private columnController;
    static TEMPLATE: string;
    private params;
    private eOpenIcon;
    private eCloseIcon;
    constructor();
    destroy(): void;
    init(params: IHeaderGroupParams): void;
    private checkWarnings;
    private setupExpandIcons;
    private addTouchAndClickListeners;
    private updateIconVisibility;
    private addInIcon;
    private addGroupExpandIcon;
    private setupLabel;
}
