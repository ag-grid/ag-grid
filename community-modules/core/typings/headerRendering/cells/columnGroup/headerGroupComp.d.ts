import { Component } from "../../../widgets/component";
import { IComponent } from "../../../interfaces/iComponent";
import { ColumnGroup } from "../../../entities/columnGroup";
import { ColumnApi } from "../../../columns/columnApi";
import { GridApi } from "../../../gridApi";
export interface IHeaderGroupParams {
    /** The column group the header is for. */
    columnGroup: ColumnGroup;
    /**
     * The text label to render.
     * If the column is using a headerValueGetter, the displayName will take this into account.
     */
    displayName: string;
    /** Opens / closes the column group */
    setExpanded: (expanded: boolean) => void;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface IHeaderGroup {
}
export interface IHeaderGroupComp extends IHeaderGroup, IComponent<IHeaderGroupParams> {
}
export declare class HeaderGroupComp extends Component implements IHeaderGroupComp {
    private columnModel;
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
