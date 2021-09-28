import { ColumnApi } from "../../../columns/columnApi";
import { Column } from "../../../entities/column";
import { GridApi } from "../../../gridApi";
import { IComponent } from "../../../interfaces/iComponent";
import { Component } from "../../../widgets/component";
export interface IHeaderParams {
    /** The column the header is for. */
    column: Column;
    /**
     * The name to display for the column.
     * If the column is using a headerValueGetter, the displayName will take this into account.
     */
    displayName: string;
    /**
     * Whether sorting is enabled for the column.
     * Only put sort logic into your header if this is true.
     */
    enableSorting: boolean;
    /**
     * Whether menu is enabled for the column.
     * Only display a menu button in your header if this is true.
     */
    enableMenu: boolean;
    /**
     * Callback to request the grid to show the column menu.
     * Pass in the html element of the column menu to have the
     *  grid position the menu over the button.
     */
    showColumnMenu: (source: HTMLElement) => void;
    /**
     * Callback to progress the sort for this column.
     * The grid will decide the next sort direction eg ascending, descending or 'no sort'.
     * Pass `multiSort=true` if you want to do a multi sort (eg user has Shift held down when they click).
     */
    progressSort: (multiSort?: boolean) => void;
    /**
     * Callback to set the sort for this column.
     * Pass the sort direction to use ignoring the current sort eg one of 'asc', 'desc' or null (for no sort).
     * Pass `multiSort=true` if you want to do a multi sort (eg user has Shift held down when they click)
     */
    setSort: (sort: string, multiSort?: boolean) => void;
    template: string;
    /**
     * The header the grid provides.
     * The custom header component is a child of the grid provided header.
     * The grid's header component is what contains the grid managed functionality such as resizing, keyboard navigation etc.
     * This is provided should you want to make changes to this cell,
     * eg add ARIA tags, or add keyboard event listener (as focus goes here when navigating to the header).
     */
    eGridHeader: HTMLElement;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
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
