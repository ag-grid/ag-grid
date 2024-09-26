import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { SortDirection } from '../../../entities/colDef';
import type { Column } from '../../../interfaces/iColumn';
import type { AgGridCommon } from '../../../interfaces/iCommon';
import type { IComponent } from '../../../interfaces/iComponent';
import type { MenuService } from '../../../misc/menuService';
import type { SortController } from '../../../sort/sortController';
import type { SortIndicatorComp } from '../../../sort/sortIndicatorComp';
import { _removeFromParent, _setDisplayed } from '../../../utils/dom';
import { _exists } from '../../../utils/generic';
import { _createIconNoSpan } from '../../../utils/icon';
import { _escapeString } from '../../../utils/string';
import { Component, RefPlaceholder } from '../../../widgets/component';
import type { LongTapEvent, TapEvent, TouchListenerEvent } from '../../../widgets/touchListener';
import { TouchListener } from '../../../widgets/touchListener';

export interface IHeaderParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
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
     * Whether filter button should be displayed in the header (for new column menu).
     */
    enableFilterButton: boolean;
    /**
     * Whether filter icon should be displayed in the header (for legacy tabbed column menu).
     */
    enableFilterIcon: boolean;
    /**
     * Callback to request the grid to show the column menu.
     * Pass in the html element of the column menu button to have the
     * grid position the menu over the button.
     */
    showColumnMenu: (source: HTMLElement) => void;
    /**
     * Callback to request the grid to show the column menu.
     * Similar to `showColumnMenu`, but will position the menu next to the provided `mouseEvent`.
     */
    showColumnMenuAfterMouseClick: (mouseEvent: MouseEvent | Touch) => void;
    /**
     * Callback to request the grid to show the filter.
     * Pass in the html element of the filter button to have the
     * grid position the menu over the button.
     */
    showFilter: (source: HTMLElement) => void;
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
    setSort: (sort: SortDirection, multiSort?: boolean) => void;

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

    /**
     * Sets a tooltip to the main element of this component.
     * @param value The value to be displayed by the tooltip
     * @param shouldDisplayTooltip A function returning a boolean that allows the tooltip to be displayed conditionally. This option does not work when `enableBrowserTooltips={true}`.
     */
    setTooltip: (value: string, shouldDisplayTooltip?: () => boolean) => void;
}

export interface IHeader {
    /** Get the header to refresh. Gets called whenever Column Defs are updated. */
    refresh(params: IHeaderParams): boolean;
}

export interface IHeaderComp extends IHeader, IComponent<IHeaderParams> {}

function getHeaderCompTemplate(includeSortIndicator: boolean): string {
    return /* html */ `<div class="ag-cell-label-container" role="presentation">
        <span data-ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
        <span data-ref="eFilterButton" class="ag-header-icon ag-header-cell-filter-button" aria-hidden="true"></span>
        <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span data-ref="eText" class="ag-header-cell-text"></span>
            <span data-ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
            ${includeSortIndicator ? '<ag-sort-indicator data-ref="eSortIndicator"></ag-sort-indicator>' : ''}
        </div>
    </div>`;
}

export class HeaderComp extends Component implements IHeaderComp {
    private sortController?: SortController;
    private menuService: MenuService;

    public wireBeans(beans: BeanCollection): void {
        this.sortController = beans.sortController;
        this.menuService = beans.menuService;
    }

    private eFilter: HTMLElement = RefPlaceholder;
    private eFilterButton?: HTMLElement = RefPlaceholder;
    private eSortIndicator: SortIndicatorComp = RefPlaceholder;
    private eMenu?: HTMLElement = RefPlaceholder;
    private eLabel: HTMLElement = RefPlaceholder;
    private eText: HTMLElement = RefPlaceholder;

    /**
     * Selectors for custom headers templates
     */
    private readonly eSortOrder: HTMLElement = RefPlaceholder;
    private readonly eSortAsc: HTMLElement = RefPlaceholder;
    private readonly eSortDesc: HTMLElement = RefPlaceholder;
    private readonly eSortMixed: HTMLElement = RefPlaceholder;
    private readonly eSortNone: HTMLElement = RefPlaceholder;

    private params: IHeaderParams;

    private currentDisplayName: string;
    private currentTemplate: string | null | undefined;
    private currentShowMenu: boolean;
    private currentSuppressMenuHide: boolean;
    private currentSort: boolean | undefined;

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public override destroy(): void {
        super.destroy();
    }

    public refresh(params: IHeaderParams): boolean {
        const oldParams = this.params;

        this.params = params;

        // if template changed, then recreate the whole comp, the code required to manage
        // a changing template is to difficult for what it's worth.
        if (
            this.workOutTemplate() != this.currentTemplate ||
            this.workOutShowMenu() != this.currentShowMenu ||
            this.workOutSort() != this.currentSort ||
            this.shouldSuppressMenuHide() != this.currentSuppressMenuHide ||
            oldParams.enableFilterButton != params.enableFilterButton ||
            oldParams.enableFilterIcon != params.enableFilterIcon
        ) {
            return false;
        }

        this.setDisplayName(params);

        return true;
    }

    private workOutTemplate(): string | null | undefined {
        let template: string | null | undefined = this.params.template ?? getHeaderCompTemplate(!!this.sortController);

        // take account of any newlines & whitespace before/after the actual template
        template = template && template.trim ? template.trim() : template;
        return template;
    }

    public init(params: IHeaderParams): void {
        this.params = params;

        this.currentTemplate = this.workOutTemplate();
        this.setTemplate(
            this.currentTemplate,
            this.sortController ? [this.sortController.getSortIndicatorSelector()] : undefined
        );
        this.setupTap();
        this.setMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setupFilterButton();
        this.setDisplayName(params);
    }

    private setDisplayName(params: IHeaderParams): void {
        if (this.currentDisplayName != params.displayName) {
            this.currentDisplayName = params.displayName;
            const displayNameSanitised = _escapeString(this.currentDisplayName, true);
            if (this.eText) {
                this.eText.textContent = displayNameSanitised!;
            }
        }
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: AgColumn): void {
        if (eParent == null) {
            return;
        }

        const eIcon = _createIconNoSpan(iconName, this.gos, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }

    private setupTap(): void {
        const { gos } = this;

        if (gos.get('suppressTouch')) {
            return;
        }

        const touchListener = new TouchListener(this.getGui(), true);
        const suppressMenuHide = this.shouldSuppressMenuHide();
        const tapMenuButton = suppressMenuHide && _exists(this.eMenu);
        const menuTouchListener = tapMenuButton ? new TouchListener(this.eMenu!, true) : touchListener;

        if (this.params.enableMenu) {
            const eventType: TouchListenerEvent = tapMenuButton ? 'tap' : 'longTap';
            const showMenuFn = (event: TapEvent | LongTapEvent) =>
                this.params.showColumnMenuAfterMouseClick(event.touchStart);
            this.addManagedListeners(menuTouchListener, { [eventType]: showMenuFn });
        }

        if (this.params.enableSorting) {
            const tapListener = (event: TapEvent) => {
                const target = event.touchStart.target as HTMLElement;
                // When suppressMenuHide is true, a tap on the menu icon or filter button will bubble up
                // to the header container, in that case we should not sort
                if (suppressMenuHide && (this.eMenu?.contains(target) || this.eFilterButton?.contains(target))) {
                    return;
                }

                this.sortController?.progressSort(this.params.column as AgColumn, false, 'uiColumnSorted');
            };

            this.addManagedListeners(touchListener, { tap: tapListener });
        }

        if (this.params.enableFilterButton) {
            const filterButtonTouchListener = new TouchListener(this.eFilterButton!, true);
            this.addManagedListeners(filterButtonTouchListener, {
                tap: () => this.params.showFilter(this.eFilterButton!),
            });
            this.addDestroyFunc(() => filterButtonTouchListener.destroy());
        }

        // if tapMenuButton is true `touchListener` and `menuTouchListener` are different
        // so we need to make sure to destroy both listeners here
        this.addDestroyFunc(() => touchListener.destroy());

        if (tapMenuButton) {
            this.addDestroyFunc(() => menuTouchListener.destroy());
        }
    }

    private workOutShowMenu(): boolean {
        return this.params.enableMenu && this.menuService.isHeaderMenuButtonEnabled();
    }

    private shouldSuppressMenuHide(): boolean {
        return this.menuService.isHeaderMenuButtonAlwaysShowEnabled();
    }

    private setMenu(): void {
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }

        this.currentShowMenu = this.workOutShowMenu();
        if (!this.currentShowMenu) {
            _removeFromParent(this.eMenu);
            this.eMenu = undefined;
            return;
        }

        const isLegacyMenu = this.menuService.isLegacyMenuEnabled();
        this.addInIcon(isLegacyMenu ? 'menu' : 'menuAlt', this.eMenu, this.params.column as AgColumn);
        this.eMenu.classList.toggle('ag-header-menu-icon', !isLegacyMenu);

        this.currentSuppressMenuHide = this.shouldSuppressMenuHide();
        this.addManagedElementListeners(this.eMenu, { click: () => this.params.showColumnMenu(this.eMenu!) });
        this.eMenu.classList.toggle('ag-header-menu-always-show', this.currentSuppressMenuHide);
    }

    public onMenuKeyboardShortcut(isFilterShortcut: boolean): boolean {
        const column = this.params.column as AgColumn;
        const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        if (isFilterShortcut && !isLegacyMenuEnabled) {
            if (this.menuService.isFilterMenuInHeaderEnabled(column)) {
                this.params.showFilter(this.eFilterButton ?? this.eMenu ?? this.getGui());
                return true;
            }
        } else if (this.params.enableMenu) {
            this.params.showColumnMenu(this.eMenu ?? this.eFilterButton ?? this.getGui());
            return true;
        }
        return false;
    }

    private workOutSort(): boolean | undefined {
        return this.params.enableSorting;
    }

    private setupSort(): void {
        if (!this.sortController) {
            return;
        }
        this.currentSort = this.params.enableSorting;

        // eSortIndicator will not be present when customers provided custom header
        // templates, in that case, we need to look for provided sort elements and
        // manually create eSortIndicator.
        if (!this.eSortIndicator) {
            this.eSortIndicator = this.createBean(this.sortController.createSortIndicator(true));
            this.eSortIndicator.attachCustomElements(
                this.eSortOrder,
                this.eSortAsc,
                this.eSortDesc,
                this.eSortMixed,
                this.eSortNone
            );
        }
        this.eSortIndicator.setupSort(this.params.column as AgColumn);

        // we set up the indicator prior to the check for whether this column is sortable, as it allows the indicator to
        // set up the multi sort indicator which can appear irrelevant of whether this column can itself be sorted.
        // this can occur in the case of a non-sortable group display column.
        if (!this.currentSort) {
            return;
        }

        this.sortController.setupHeader(this, this.params.column as AgColumn, this.eLabel);
    }

    private setupFilterIcon(): void {
        if (!this.eFilter) {
            return;
        }
        this.configureFilter(this.params.enableFilterIcon, this.eFilter, this.onFilterChangedIcon.bind(this));
    }

    private setupFilterButton(): void {
        if (!this.eFilterButton) {
            return;
        }
        const configured = this.configureFilter(
            this.params.enableFilterButton,
            this.eFilterButton,
            this.onFilterChangedButton.bind(this)
        );
        if (configured) {
            this.addManagedElementListeners(this.eFilterButton, {
                click: () => this.params.showFilter(this.eFilterButton!),
            });
        } else {
            this.eFilterButton = undefined;
        }
    }

    private configureFilter(enabled: boolean, element: HTMLElement, filterChangedCallback: () => void): boolean {
        if (!enabled) {
            _removeFromParent(element);
            return false;
        }

        const column = this.params.column as AgColumn;
        this.addInIcon('filter', element, column);

        this.addManagedListeners(column, { filterChanged: filterChangedCallback });
        filterChangedCallback();
        return true;
    }

    private onFilterChangedIcon(): void {
        const filterPresent = this.params.column.isFilterActive();
        _setDisplayed(this.eFilter, filterPresent, { skipAriaHidden: true });
    }

    private onFilterChangedButton(): void {
        const filterPresent = this.params.column.isFilterActive();
        this.eFilterButton!.classList.toggle('ag-filter-active', filterPresent);
    }

    public getAnchorElementForMenu(isFilter?: boolean): HTMLElement {
        if (isFilter) {
            return this.eFilterButton ?? this.eMenu ?? this.getGui();
        }
        return this.eMenu ?? this.eFilterButton ?? this.getGui();
    }
}
