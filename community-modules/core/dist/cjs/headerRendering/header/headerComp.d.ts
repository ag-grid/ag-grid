// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    eGridHeader: HTMLElement;
    api: GridApi;
    context: any;
    template: string;
}
export interface IHeader {
    /** Get the header to refresh. Gets called whenever Column Defs are updated. */
    refresh(params: IHeaderParams): boolean;
}
export interface IHeaderComp extends IHeader, IComponent<IHeaderParams> {
}
export declare class HeaderComp extends Component implements IHeaderComp {
    private static TEMPLATE;
    private sortController;
    private menuFactory;
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
    private currentDisplayName;
    private currentTemplate;
    private currentShowMenu;
    private currentSort;
    destroy(): void;
    refresh(params: IHeaderParams): boolean;
    private workOutTemplate;
    init(params: IHeaderParams): void;
    private setDisplayName;
    private setupIcons;
    private addInIcon;
    private setupTap;
    private workOutShowMenu;
    private setMenu;
    showMenu(eventSource?: HTMLElement): void;
    private removeSortIcons;
    private workOutSort;
    setupSort(): void;
    private onSortChanged;
    private setMultiSortOrder;
    private setupFilterIcon;
    private onFilterChanged;
}
