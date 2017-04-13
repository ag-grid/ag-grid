// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { IComponent } from "../../interfaces/iComponent";
import { ColumnApi } from "../../columnController/columnController";
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
    constructor();
    init(params: IHeaderParams): void;
    private setupText(displayName);
    private setupIcons(column);
    private addInIcon(iconName, eParent, column, defaultIconFactory);
    private setupTap();
    private setupMenu();
    showMenu(eventSource: HTMLElement): void;
    setupSort(): void;
    private onSortChanged();
    private setMultiSortOrder();
    private setupFilterIcon();
    private onFilterChanged();
}
