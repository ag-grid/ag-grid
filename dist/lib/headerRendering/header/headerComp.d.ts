import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { IComponent } from "../../interfaces/iComponent";
import { ColumnApi } from "../../columnController/columnApi";
import { GridApi } from "../../gridApi";
export interface IHeaderParams {
    column: Column;
    displayName: string;
    enableSorting: boolean;
    enableMenu: boolean;
    showColumnMenu: (source: HTMLElement) => void;
    progressSort: (multiSort?: boolean) => void;
    setSort: (sort: string, multiSort?: boolean) => void;
    columnApi: ColumnApi;
    api: GridApi;
    context: any;
    template: string;
}
export interface IHeader {
}
export interface IHeaderComp extends IHeader, IComponent<IHeaderParams> {
}
export declare class HeaderComp extends Component implements IHeaderComp {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private sortController;
    private menuFactory;
    private eventService;
    private eFilter;
    private eSortAsc;
    private eSortDesc;
    private eSortNone;
    private eSortOrder;
    private eMenu;
    private eLabel;
    private eText;
    private params;
    private lastMovingChanged;
    init(params: IHeaderParams): void;
    private setupText;
    private setupIcons;
    private addInIcon;
    private setupTap;
    private setupMenu;
    showMenu(eventSource: HTMLElement): void;
    private removeSortIcons;
    setupSort(): void;
    private onSortChanged;
    private setMultiSortOrder;
    private setupFilterIcon;
    private onFilterChanged;
}
