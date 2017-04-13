// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
import { ColumnGroup } from "../../entities/columnGroup";
import { ColumnApi } from "../../columnController/columnController";
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
    private gridOptionsWrapper;
    static TEMPLATE: string;
    private params;
    private eOpenIcon;
    private eCloseIcon;
    constructor();
    init(params: IHeaderGroupParams): void;
    private setupExpandIcons();
    private addTouchAndClickListeners(eElement);
    private updateIconVisibilty();
    private removeExpandIcons();
    private addInIcon(iconName, refName, defaultIconFactory);
    private addGroupExpandIcon();
    private setupLabel();
}
