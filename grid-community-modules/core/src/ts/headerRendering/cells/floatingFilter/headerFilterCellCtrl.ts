import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired } from '../../../context/context';
import { Column } from '../../../entities/column';
import { Events, FilterChangedEvent } from '../../../events';
import { FilterManager } from '../../../filter/filterManager';
import { IFloatingFilter } from '../../../filter/floating/floatingFilter';
import { IMenuFactory } from '../../../interfaces/iMenuFactory';
import { ColumnHoverService } from '../../../rendering/columnHoverService';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { AgPromise } from '../../../utils';
import { isElementChildOfClass } from '../../../utils/dom';
import { createIconNoSpan } from '../../../utils/icon';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import { HoverFeature } from '../hoverFeature';
import { UserCompDetails } from "../../../components/framework/userComponentFactory";

export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveBodyCssClass(cssClassName: string, on: boolean): void;
    setButtonWrapperDisplayed(displayed: boolean): void;
    setCompDetails(compDetails: UserCompDetails): void;
    getFloatingFilterComp(): AgPromise<IFloatingFilter> | null;
    setWidth(width: string): void;
    setMenuIcon(icon: HTMLElement): void;
}

export class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl {

    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnHoverService') private readonly columnHoverService: ColumnHoverService;
    @Autowired('menuFactory') private readonly menuFactory: IMenuFactory;

    private comp: IHeaderFilterCellComp;

    private column: Column;

    private eButtonShowMainFilter: HTMLElement;
    private eFloatingFilterBody: HTMLElement;

    private suppressFilterButton: boolean;
    private active: boolean;

    constructor(column: Column, parentRowCtrl: HeaderRowCtrl) {
        super(column, parentRowCtrl);
        this.column = column;
    }

    public setComp(comp: IHeaderFilterCellComp, eGui: HTMLElement, eButtonShowMainFilter: HTMLElement, eFloatingFilterBody: HTMLElement): void {
        super.setGui(eGui);
        this.comp = comp;
        this.eButtonShowMainFilter = eButtonShowMainFilter;
        this.eFloatingFilterBody = eFloatingFilterBody;

        const colDef = this.column.getColDef();
        const filterExists = !!colDef.filter || !!colDef.filterFramework;
        const floatingFilterExists = !!colDef.floatingFilter;
        this.active = filterExists && floatingFilterExists;

        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();

        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        if (this.active) {
            this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, this.updateFilterButton.bind(this));
        }
    }

    private setupUi(): void {
        this.comp.setButtonWrapperDisplayed(!this.suppressFilterButton && this.active);

        if (!this.active) { return; }

        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);

        const eMenuIcon = createIconNoSpan('filter', this.gridOptionsService, this.column);

        if (eMenuIcon) {
            this.eButtonShowMainFilter.appendChild(eMenuIcon);
        }
    }

    private setupFocus(): void {
        this.createManagedBean(new ManagedFocusFeature(
            this.eGui,
            {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this)
            }
        ));
    }

    private onTabKeyDown(e: KeyboardEvent) {
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement as HTMLElement;
        const wrapperHasFocus = activeEl === this.eGui;

        if (wrapperHasFocus) { return; }

        const nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);

        if (nextFocusableEl) {
            this.beans.headerNavigationService.scrollToColumn(this.column);
            e.preventDefault();
            nextFocusableEl.focus();
            return;
        }

        const nextFocusableColumn = this.findNextColumnWithFloatingFilter(e.shiftKey);

        if (!nextFocusableColumn) { return; }

        if (this.focusService.focusHeaderPosition({
            headerPosition: {
                headerRowIndex: this.getParentRowCtrl().getRowIndex(),
                column: nextFocusableColumn
            },
            event: e
        })) {
            e.preventDefault();
        }
    }

    private findNextColumnWithFloatingFilter(backwards: boolean): Column | null {
        const columModel = this.beans.columnModel;
        let nextCol: Column | null = this.column;

        do {
            nextCol = backwards
                ? columModel.getDisplayedColBefore(nextCol)
                : columModel.getDisplayedColAfter(nextCol);

            if (!nextCol) { break; }

        } while (!nextCol.getColDef().filter || !nextCol.getColDef().floatingFilter);

        return nextCol;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        const wrapperHasFocus = this.getWrapperHasFocus();

        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                if (wrapperHasFocus) { return; }
                e.stopPropagation();
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
        if (isRelatedWithin) { return; }

        const notFromHeaderWrapper = !!e.relatedTarget && !(e.relatedTarget as HTMLElement).classList.contains('ag-floating-filter');
        const fromWithinHeader = !!e.relatedTarget && isElementChildOfClass(e.relatedTarget as HTMLElement, 'ag-floating-filter');

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
            if (!this.gridOptionsService.is('columnHoverHighlight')) { return; }
            const hovered = this.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', hovered);
        };

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }

    private setupLeft(): void {
        const setLeftFeature = new SetLeftFeature(this.column, this.eGui, this.beans);
        this.createManagedBean(setLeftFeature);
    }

    private setupUserComp(): void {
        if (!this.active) { return; }

        const colDef = this.column.getColDef();
        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;

        const compDetails = this.filterManager.getFloatingFilterCompDetails(
            this.column,
            () => this.showParentFilter()
        );

        if (compDetails) {
            this.comp.setCompDetails(compDetails);
        }
    }

    private showParentFilter() {
        const eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource, 'floatingFilter', 'filterMenuTab', ['filterMenuTab']);
    }

    private setupSyncWithFilter(): void {
        if (!this.active) { return; }

        const syncWithFilter = (filterChangedEvent: FilterChangedEvent | null) => {
            const compPromise = this.comp.getFloatingFilterComp();

            if (!compPromise) { return; }

            const parentModel = this.filterManager.getCurrentFloatingFilterParentModel(this.column);

            compPromise.then(comp => {
                if (comp) {
                    comp.onParentModelChanged(parentModel, filterChangedEvent);
                }
            });
        };

        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, syncWithFilter);

        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    }

    private setupWidth(): void {
        const listener = () => {
            const width = `${this.column.getActualWidth()}px`;
            this.comp.setWidth(width);
        };

        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }

    private updateFilterButton(): void {
        if (!this.suppressFilterButton && this.comp) {
            this.comp.setButtonWrapperDisplayed(this.filterManager.isFilterAllowed(this.column));
        }
    }
}
