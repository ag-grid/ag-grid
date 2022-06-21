import { Autowired } from "../../../context/context";
import { Column } from "../../../entities/column";
import { IComponent } from "../../../interfaces/iComponent";
import { IMenuFactory } from "../../../interfaces/iMenuFactory";
import { AgGridCommon } from "../../../interfaces/iCommon";
import { SortController } from "../../../sortController";
import { firstExistingValue } from "../../../utils/array";
import { isIOSUserAgent } from "../../../utils/browser";
import { removeFromParent } from "../../../utils/dom";
import { exists } from "../../../utils/generic";
import { createIconNoSpan } from "../../../utils/icon";
import { escapeString } from "../../../utils/string";
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { LongTapEvent, TapEvent, TouchListener } from "../../../widgets/touchListener";
import { SortIndicatorComp } from "./sortIndicatorComp";
import { ColumnModel } from "../../../columns/columnModel";
import { Events } from "../../../eventKeys";

export interface IHeaderParams extends AgGridCommon {
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
    enableSorting: boolean | undefined;
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
    setSort: (sort: 'asc' | 'desc' | null, multiSort?: boolean) => void;

    /** Custom header template if provided to `headerComponentParams`, otherwise will be `undefined`. See [Header Templates](https://ag-grid.com/javascript-data-grid/column-headers/#header-templates) */
    template?: string;
    /**
     * The header the grid provides.
     * The custom header component is a child of the grid provided header.
     * The grid's header component is what contains the grid managed functionality such as resizing, keyboard navigation etc.
     * This is provided should you want to make changes to this cell,
     * eg add ARIA tags, or add keyboard event listener (as focus goes here when navigating to the header).
     */
    eGridHeader: HTMLElement;
}

export interface IHeader {
    /** Get the header to refresh. Gets called whenever Column Defs are updated. */
    refresh(params: IHeaderParams): boolean;
}

export interface IHeaderComp extends IHeader, IComponent<IHeaderParams> { }

export class HeaderComp extends Component implements IHeaderComp {

    private static TEMPLATE = /* html */
        `<div class="ag-cell-label-container" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
            <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                <span ref="eText" class="ag-header-cell-text"></span>
                <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
                <ag-sort-indicator ref="eSortIndicator"></ag-sort-indicator>
            </div>
        </div>`;

    @Autowired('sortController') private sortController: SortController;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('columnModel')  private readonly  columnModel: ColumnModel;

    @RefSelector('eFilter') private eFilter: HTMLElement;
    @RefSelector('eSortIndicator') private eSortIndicator: SortIndicatorComp;
    @RefSelector('eMenu') private eMenu: HTMLElement;
    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eText') private eText: HTMLElement;

    private params: IHeaderParams;

    private lastMovingChanged = 0;

    private currentDisplayName: string;
    private currentTemplate: string | null | undefined;
    private currentShowMenu: boolean;
    private currentSort: boolean | undefined;

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public refresh(params: IHeaderParams): boolean {

        this.params = params;

        // if template changed, then recreate the whole comp, the code required to manage
        // a changing template is to difficult for what it's worth.
        if (this.workOutTemplate() != this.currentTemplate) { return false; }
        if (this.workOutShowMenu() != this.currentShowMenu) { return false; }
        if (this.workOutSort() != this.currentSort) { return false; }

        this.setDisplayName(params);

        return true;
    }

    private workOutTemplate(): string | null | undefined {
        let template: string | null | undefined = firstExistingValue(
            this.params.template,
            HeaderComp.TEMPLATE
        );

        // take account of any newlines & whitespace before/after the actual template
        template = template && template.trim ? template.trim() : template;
        return template;
    }

    public init(params: IHeaderParams): void {
        this.params = params;

        this.currentTemplate = this.workOutTemplate();
        this.setTemplate(this.currentTemplate);
        this.setupTap();
        this.setupIcons(params.column);
        this.setMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setDisplayName(params);
    }

    private setDisplayName(params: IHeaderParams): void {
        if (this.currentDisplayName != params.displayName) {
            this.currentDisplayName = params.displayName;
            const displayNameSanitised = escapeString(this.currentDisplayName);
            if (this.eText) {
                this.eText.innerHTML = displayNameSanitised!;
            }
        }
    }

    private setupIcons(column: Column): void {
        this.addInIcon('menu', this.eMenu, column);
        this.addInIcon('filter', this.eFilter, column);
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column): void {
        if (eParent == null) { return; }

        const eIcon = createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }

    private setupTap(): void {
        const { gridOptionsWrapper: options } = this;

        if (options.isSuppressTouch()) { return; }

        const touchListener = new TouchListener(this.getGui(), true);
        const suppressMenuHide = options.isSuppressMenuHide();
        const tapMenuButton = suppressMenuHide && exists(this.eMenu);
        const menuTouchListener = tapMenuButton ? new TouchListener(this.eMenu, true) : touchListener;

        if (this.params.enableMenu) {
            const eventType = tapMenuButton ? 'EVENT_TAP' : 'EVENT_LONG_TAP';
            const showMenuFn = (event: TapEvent | LongTapEvent) => {
                options.getApi()!.showColumnMenuAfterMouseClick(this.params.column, event.touchStart);
            };
            this.addManagedListener(menuTouchListener, TouchListener[eventType], showMenuFn);
        }

        if (this.params.enableSorting) {
            const tapListener = (event: TapEvent) => {
                const target = event.touchStart.target as HTMLElement;
                // When suppressMenuHide is true, a tap on the menu icon will bubble up
                // to the header container, in that case we should not sort
                if (suppressMenuHide && this.eMenu.contains(target)) { return; }

                this.sortController.progressSort(this.params.column, false, "uiColumnSorted");
            };

            this.addManagedListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        }

        // if tapMenuButton is true `touchListener` and `menuTouchListener` are different
        // so we need to make sure to destroy both listeners here
        this.addDestroyFunc(() => touchListener.destroy());

        if (tapMenuButton) {
            this.addDestroyFunc(() => menuTouchListener.destroy());
        }
    }

    private workOutShowMenu(): boolean {
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device/
        // However if suppressMenuHide is set to true the menu will be displayed alwasys, so it's ok
        // to show it on iPad in this case (as hover isn't needed). If suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        const menuHides = !this.gridOptionsWrapper.isSuppressMenuHide();

        const onIpadAndMenuHides = isIOSUserAgent() && menuHides;
        const showMenu = this.params.enableMenu && !onIpadAndMenuHides;

        return showMenu;
    }

    private setMenu(): void {
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }

        this.currentShowMenu = this.workOutShowMenu();
        if (!this.currentShowMenu) {
            removeFromParent(this.eMenu);
            return;
        }

        const suppressMenuHide = this.gridOptionsWrapper.isSuppressMenuHide();
        this.addManagedListener(this.eMenu, 'click', () => this.showMenu(this.eMenu));
        this.eMenu.classList.toggle('ag-header-menu-always-show', suppressMenuHide);
    }

    public showMenu(eventSource?: HTMLElement) {
        if (!eventSource) {
            eventSource = this.eMenu;
        }

        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource, 'columnMenu');
    }

    private workOutSort(): boolean | undefined {
        return this.params.enableSorting;
    }

    public setupSort(): void {
        this.currentSort = this.params.enableSorting;

        if (this.eSortIndicator) {
            this.eSortIndicator.setupSort(this.params.column);
        }

        // we set up the indicator prior to the check for whether this column is sortable, as it allows the indicator to
        // set up the multi sort indicator which can appear irrelevant of whether this column can itself be sorted.
        if (!this.currentSort) {
            return;
        }

        const sortUsingCtrl = this.gridOptionsWrapper.isMultiSortKeyCtrl();

        // keep track of last time the moving changed flag was set
        this.addManagedListener(this.params.column, Column.EVENT_MOVING_CHANGED, () => {
            this.lastMovingChanged = new Date().getTime();
        });

        // add the event on the header, so when clicked, we do sorting
        if (this.eLabel) {
            this.addManagedListener(this.eLabel, 'click', (event: MouseEvent) => {

                // sometimes when moving a column via dragging, this was also firing a clicked event.
                // here is issue raised by user: https://ag-grid.zendesk.com/agent/tickets/1076
                // this check stops sort if a) column is moving or b) column moved less than 200ms ago (so caters for race condition)
                const moving = this.params.column.isMoving();
                const nowTime = new Date().getTime();
                // typically there is <2ms if moving flag was set recently, as it would be done in same VM turn
                const movedRecently = (nowTime - this.lastMovingChanged) < 50;
                const columnMoving = moving || movedRecently;

                if (!columnMoving) {
                    const multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                    this.params.progressSort(multiSort);
                }
            });
        }

        const onSortingChanged = () => {
            this.addOrRemoveCssClass('ag-header-cell-sorted-asc', this.params.column.isSortAscending());
            this.addOrRemoveCssClass('ag-header-cell-sorted-desc', this.params.column.isSortDescending());
            this.addOrRemoveCssClass('ag-header-cell-sorted-none', this.params.column.isSortNone());

            if (this.params.column.getColDef().showRowGroup) {
                const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.params.column);
                // this == is intentional, as it allows null and undefined to match, which are both unsorted states
                const sortDirectionsMatch = sourceColumns?.every(sourceCol => this.params.column.getSort() == sourceCol.getSort());
                const isMultiSorting = !sortDirectionsMatch;

                this.addOrRemoveCssClass('ag-header-cell-sorted-mixed', isMultiSorting);
            }
        };
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, onSortingChanged);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, onSortingChanged);
    }

    private setupFilterIcon(): void {

        if (!this.eFilter) { return; }

        this.addManagedListener(this.params.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    }

    private onFilterChanged(): void {
        const filterPresent = this.params.column.isFilterActive();
        this.eFilter.classList.toggle('ag-hidden', !filterPresent);
    }
}
