import type { BeanCollection } from '@ag-grid-community/core';

import type { UserCompDetails } from '../../../components/framework/userComponentFactory';
import { KeyCode } from '../../../constants/keyCode';
import type { AgColumn } from '../../../entities/agColumn';
import type { ColumnEvent, FilterChangedEvent } from '../../../events';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { _setAriaLabel } from '../../../utils/aria';
import { _isElementChildOfClass } from '../../../utils/dom';
import { _warnOnce } from '../../../utils/function';
import { _createIconNoSpan } from '../../../utils/icon';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import type { HeaderRowCtrl } from '../../row/headerRowCtrl';
import { AbstractHeaderCellCtrl } from '../abstractCell/abstractHeaderCellCtrl';
import { HoverFeature } from '../hoverFeature';
import type { IHeaderFilterCellComp } from './iHeaderFilterCellComp';

export class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl<IHeaderFilterCellComp, AgColumn> {
    private eButtonShowMainFilter: HTMLElement;
    private eFloatingFilterBody: HTMLElement;

    private suppressFilterButton: boolean;
    private highlightFilterButtonWhenActive: boolean;
    private active: boolean;
    private iconCreated: boolean = false;

    private userCompDetails?: UserCompDetails | null;
    private destroySyncListener: () => null;
    private destroyFilterChangedListener: () => null;

    constructor(column: AgColumn, beans: BeanCollection, parentRowCtrl: HeaderRowCtrl) {
        super(column, beans, parentRowCtrl);
        this.column = column;
    }

    public setComp(
        comp: IHeaderFilterCellComp,
        eGui: HTMLElement,
        eButtonShowMainFilter: HTMLElement,
        eFloatingFilterBody: HTMLElement
    ): void {
        this.comp = comp;
        this.eButtonShowMainFilter = eButtonShowMainFilter;
        this.eFloatingFilterBody = eFloatingFilterBody;

        this.setGui(eGui);
        this.setupActive();

        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupAria();
        this.setupFilterButton();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();

        this.addManagedElementListeners(this.eButtonShowMainFilter, { click: this.showParentFilter.bind(this) });
        this.setupFilterChangedListener();
        this.addManagedListeners(this.column, { colDefChanged: this.onColDefChanged.bind(this) });
    }

    // empty abstract method
    protected resizeHeader(): void {}
    // empty abstract method
    protected moveHeader(): void {}

    private setupActive(): void {
        const colDef = this.column.getColDef();
        const filterExists = !!colDef.filter;
        const floatingFilterExists = !!colDef.floatingFilter;
        this.active = filterExists && floatingFilterExists;
    }

    private setupUi(): void {
        this.comp.setButtonWrapperDisplayed(!this.suppressFilterButton && this.active);

        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);

        if (!this.active || this.iconCreated) {
            return;
        }

        const eMenuIcon = _createIconNoSpan('filter', this.gos, this.column);

        if (eMenuIcon) {
            this.iconCreated = true;
            this.eButtonShowMainFilter.appendChild(eMenuIcon);
        }
    }

    private setupFocus(): void {
        this.createManagedBean(
            new ManagedFocusFeature(this.eGui, {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this),
            })
        );
    }

    private setupAria(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        _setAriaLabel(this.eButtonShowMainFilter, localeTextFunc('ariaFilterMenuOpen', 'Open Filter Menu'));
    }

    private onTabKeyDown(e: KeyboardEvent) {
        const activeEl = this.gos.getActiveDomElement();
        const wrapperHasFocus = activeEl === this.eGui;

        if (wrapperHasFocus) {
            return;
        }

        const nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);

        if (nextFocusableEl) {
            this.beans.headerNavigationService.scrollToColumn(this.column);
            e.preventDefault();
            nextFocusableEl.focus();
            return;
        }

        const nextFocusableColumn = this.findNextColumnWithFloatingFilter(e.shiftKey);

        if (!nextFocusableColumn) {
            return;
        }

        if (
            this.focusService.focusHeaderPosition({
                headerPosition: {
                    headerRowIndex: this.getParentRowCtrl().getRowIndex(),
                    column: nextFocusableColumn,
                },
                event: e,
            })
        ) {
            e.preventDefault();
        }
    }

    private findNextColumnWithFloatingFilter(backwards: boolean): AgColumn | null {
        const presentedColsService = this.beans.visibleColsService;
        let nextCol: AgColumn | null = this.column;

        do {
            nextCol = backwards
                ? presentedColsService.getColBefore(nextCol)
                : presentedColsService.getColAfter(nextCol);

            if (!nextCol) {
                break;
            }
        } while (!nextCol.getColDef().filter || !nextCol.getColDef().floatingFilter);

        return nextCol;
    }

    protected override handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        const wrapperHasFocus = this.getWrapperHasFocus();

        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            // eslint-disable-next-line no-fallthrough
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                if (wrapperHasFocus) {
                    return;
                }
                e.stopPropagation();
            // eslint-disable-next-line no-fallthrough
            case KeyCode.ENTER:
                if (wrapperHasFocus) {
                    if (this.focusService.focusInto(this.eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case KeyCode.ESCAPE:
                if (!wrapperHasFocus) {
                    this.eGui.focus();
                }
        }
    }

    private onFocusIn(e: FocusEvent): void {
        const isRelatedWithin = this.eGui.contains(e.relatedTarget as HTMLElement);

        // when the focus is already within the component,
        // we default to the browser's behavior
        if (isRelatedWithin) {
            return;
        }

        const notFromHeaderWrapper =
            !!e.relatedTarget && !(e.relatedTarget as HTMLElement).classList.contains('ag-floating-filter');
        const fromWithinHeader =
            !!e.relatedTarget && _isElementChildOfClass(e.relatedTarget as HTMLElement, 'ag-floating-filter');

        if (notFromHeaderWrapper && fromWithinHeader && e.target === this.eGui) {
            const lastFocusEvent = this.lastFocusEvent;
            const fromTab = !!(lastFocusEvent && lastFocusEvent.key === KeyCode.TAB);

            if (lastFocusEvent && fromTab) {
                const shouldFocusLast = lastFocusEvent.shiftKey;

                this.focusService.focusInto(this.eGui, shouldFocusLast);
            }
        }

        const rowIndex = this.getRowIndex();
        this.beans.focusService.setFocusedHeader(rowIndex, this.column);
    }

    private setupHover(): void {
        this.createManagedBean(new HoverFeature([this.column], this.eGui));

        const listener = () => {
            if (!this.gos.get('columnHoverHighlight')) {
                return;
            }
            const hovered = this.beans.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', hovered);
        };

        this.addManagedEventListeners({ columnHoverChanged: listener });
        listener();
    }

    private setupLeft(): void {
        const setLeftFeature = new SetLeftFeature(this.column, this.eGui, this.beans);
        this.createManagedBean(setLeftFeature);
    }

    private setupFilterButton(): void {
        this.suppressFilterButton = !this.menuService.isFloatingFilterButtonEnabled(this.column);
        this.highlightFilterButtonWhenActive = !this.menuService.isLegacyMenuEnabled();
    }

    private setupUserComp(): void {
        if (!this.active) {
            return;
        }

        const compDetails = this.beans.filterManager?.getFloatingFilterCompDetails(this.column, () =>
            this.showParentFilter()
        );

        if (compDetails) {
            this.setCompDetails(compDetails);
        }
    }

    private setCompDetails(compDetails?: UserCompDetails | null): void {
        this.userCompDetails = compDetails;
        this.comp.setCompDetails(compDetails);
    }

    private showParentFilter() {
        const eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuService.showFilterMenu({
            column: this.column,
            buttonElement: eventSource,
            containerType: 'floatingFilter',
            positionBy: 'button',
        });
    }

    private setupSyncWithFilter(): void {
        if (!this.active) {
            return;
        }
        const { filterManager } = this.beans;

        const syncWithFilter = (event: ColumnEvent | null) => {
            if (event?.source === 'filterDestroyed' && !this.isAlive()) {
                return;
            }
            const compPromise = this.comp.getFloatingFilterComp();

            if (!compPromise) {
                return;
            }

            compPromise.then((comp) => {
                if (comp) {
                    const parentModel = filterManager?.getCurrentFloatingFilterParentModel(this.column);
                    comp.onParentModelChanged(
                        parentModel,
                        event
                            ? this.gos.addGridCommonParams<FilterChangedEvent>({
                                  columns: event.columns ?? [],
                                  type: 'filterChanged',
                                  source: event.source === 'api' ? 'api' : 'columnFilter',
                              })
                            : null
                    );
                }
            });
        };

        [this.destroySyncListener] = this.addManagedListeners(this.column, { filterChanged: syncWithFilter });

        if (filterManager?.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    }

    private setupWidth(): void {
        const listener = () => {
            const width = `${this.column.getActualWidth()}px`;
            this.comp.setWidth(width);
        };

        this.addManagedListeners(this.column, { widthChanged: listener });
        listener();
    }

    private setupFilterChangedListener(): void {
        if (this.active) {
            [this.destroyFilterChangedListener] = this.addManagedListeners(this.column, {
                filterChanged: this.updateFilterButton.bind(this),
            });
            this.updateFilterButton();
        }
    }

    private updateFilterButton(): void {
        if (!this.suppressFilterButton && this.comp) {
            const isFilterAllowed = !!this.beans.filterManager?.isFilterAllowed(this.column);
            this.comp.setButtonWrapperDisplayed(isFilterAllowed);
            if (this.highlightFilterButtonWhenActive && isFilterAllowed) {
                this.eButtonShowMainFilter.classList.toggle('ag-filter-active', this.column.isFilterActive());
            }
        }
    }

    private onColDefChanged(): void {
        const wasActive = this.active;
        this.setupActive();
        const becomeActive = !wasActive && this.active;
        if (wasActive && !this.active) {
            this.destroySyncListener();
            this.destroyFilterChangedListener();
        }

        const newCompDetails = this.active
            ? this.beans.filterManager?.getFloatingFilterCompDetails(this.column, () => this.showParentFilter())
            : null;

        const compPromise = this.comp.getFloatingFilterComp();
        if (!compPromise || !newCompDetails) {
            this.updateCompDetails(newCompDetails, becomeActive);
        } else {
            compPromise.then((compInstance) => {
                if (
                    !compInstance ||
                    this.beans.filterManager?.areFilterCompsDifferent(this.userCompDetails ?? null, newCompDetails)
                ) {
                    this.updateCompDetails(newCompDetails, becomeActive);
                } else {
                    this.updateFloatingFilterParams(newCompDetails);
                }
            });
        }
    }

    private updateCompDetails(compDetails: UserCompDetails | null | undefined, becomeActive: boolean): void {
        if (!this.isAlive()) {
            return;
        }
        this.setCompDetails(compDetails);
        // filter button and UI can change based on params, so always want to update
        this.setupFilterButton();
        this.setupUi();
        if (becomeActive) {
            this.setupSyncWithFilter();
            this.setupFilterChangedListener();
        }
    }

    private updateFloatingFilterParams(userCompDetails?: UserCompDetails | null): void {
        if (!userCompDetails) {
            return;
        }

        const params = userCompDetails.params;

        this.comp.getFloatingFilterComp()?.then((floatingFilter) => {
            let hasRefreshed = false;
            if (floatingFilter?.refresh && typeof floatingFilter.refresh === 'function') {
                const result = floatingFilter.refresh(params);
                // framework wrapper always implements optional methods, but returns null if no underlying method
                if (result !== null) {
                    hasRefreshed = true;
                }
            }
            if (
                !hasRefreshed &&
                floatingFilter?.onParamsUpdated &&
                typeof floatingFilter.onParamsUpdated === 'function'
            ) {
                const result = floatingFilter.onParamsUpdated(params);
                if (result !== null) {
                    _warnOnce(`Custom floating filter method 'onParamsUpdated' is deprecated. Use 'refresh' instead.`);
                }
            }
        });
    }

    public override destroy(): void {
        super.destroy();

        (this.eButtonShowMainFilter as any) = null;
        (this.eFloatingFilterBody as any) = null;
        (this.userCompDetails as any) = null;
        (this.destroySyncListener as any) = null;
        (this.destroyFilterChangedListener as any) = null;
    }
}
