import { Autowired } from '../../context/context';
import { IMenuFactory } from '../../interfaces/iMenuFactory';
import { Column } from '../../entities/column';
import { SetLeftFeature } from '../../rendering/features/setLeftFeature';
import { IFloatingFilterComp, IFloatingFilterParams } from './../floating/floatingFilter';
import { RefSelector } from '../../widgets/componentAnnotations';
import { GridOptionsWrapper } from '../../gridOptionsWrapper';
import { HoverFeature } from '../../headerRendering/hoverFeature';
import { Events, FilterChangedEvent } from '../../events';
import { ColumnHoverService } from '../../rendering/columnHoverService';
import { Promise } from '../../utils';
import { ColDef } from '../../entities/colDef';
import { IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { UserComponentFactory } from '../../components/framework/userComponentFactory';
import { GridApi } from '../../gridApi';
import { ColumnApi } from '../../columnController/columnApi';
import { FilterManager } from './../filterManager';
import { ReadOnlyFloatingFilter } from './provided/readOnlyFloatingFilter';
import { ModuleNames } from '../../modules/moduleNames';
import { ModuleRegistry } from '../../modules/moduleRegistry';
import { addOrRemoveCssClass, setDisplayed } from '../../utils/dom';
import { createIconNoSpan } from '../../utils/icon';
import { AbstractHeaderWrapper } from '../../headerRendering/header/abstractHeaderWrapper';
import { Constants } from '../../constants';
import { Beans } from '../../rendering/beans';
import { HeaderRowComp } from '../../headerRendering/headerRowComp';

export class FloatingFilterWrapper extends AbstractHeaderWrapper {
    private static filterToFloatingFilterNames: { [p: string]: string; } = {
        set: 'agSetColumnFloatingFilter',
        agSetColumnFilter: 'agSetColumnFloatingFilter',

        combined: 'agCombinedColumnFloatingFilter',
        agCombinedColumnFilter: 'agCombinedColumnFloatingFilter',

        number: 'agNumberColumnFloatingFilter',
        agNumberColumnFilter: 'agNumberColumnFloatingFilter',

        date: 'agDateColumnFloatingFilter',
        agDateColumnFilter: 'agDateColumnFloatingFilter',

        text: 'agTextColumnFloatingFilter',
        agTextColumnFilter: 'agTextColumnFloatingFilter'
    };

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell" role="presentation" tabindex="-1">
            <div ref="eFloatingFilterBody" role="columnheader"></div>
            <div class="ag-floating-filter-button" ref="eButtonWrapper" role="presentation">
                <button type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" ref="eButtonShowMainFilter" tabindex="-1"></button>
            </div>
        </div>`;

    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('beans') protected beans: Beans;

    @RefSelector('eFloatingFilterBody') private eFloatingFilterBody: HTMLElement;
    @RefSelector('eButtonWrapper') private eButtonWrapper: HTMLElement;
    @RefSelector('eButtonShowMainFilter') private eButtonShowMainFilter: HTMLElement;

    protected readonly column: Column;
    protected readonly pinned: string;

    private suppressFilterButton: boolean;

    private floatingFilterCompPromise: Promise<IFloatingFilterComp>;

    constructor(column: Column, pinned: string) {
        super(FloatingFilterWrapper.TEMPLATE);
        this.column = column;
        this.pinned = pinned;
    }

    protected postConstruct(): void {
        super.postConstruct();

        this.setupFloatingFilter();
        this.setupWidth();
        this.setupLeftPositioning();
        this.setupColumnHover();
        this.createManagedBean(new HoverFeature([this.column], this.getGui()));

        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        const activeEl = document.activeElement as HTMLElement;
        const eGui = this.getGui();
        const wrapperHasFocus = activeEl === eGui;

        if (wrapperHasFocus) { return; }

        e.preventDefault();

        const nextFocusableEl = this.focusController.findNextFocusableElement(eGui, null, e.shiftKey);

        if (nextFocusableEl) {
            nextFocusableEl.focus();
        } else {
            eGui.focus();
        }
    }

    protected handleKeyDown(e: KeyboardEvent) {
        const activeEl = document.activeElement;
        const eGui = this.getGui();
        const wrapperHasFocus = activeEl === eGui;

        switch (e.keyCode) {
            case Constants.KEY_UP:
            case Constants.KEY_DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            case Constants.KEY_LEFT:
            case Constants.KEY_RIGHT:
                if (wrapperHasFocus) { return; }
                e.stopPropagation();
            case Constants.KEY_ENTER:
                if (wrapperHasFocus) {
                    if (this.focusController.focusFirstFocusableElement(eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case Constants.KEY_ESCAPE:
                if (!wrapperHasFocus) {
                    this.getGui().focus();
                }
        }
    }

    protected onFocusIn(e: FocusEvent) {
        const eGui = this.getGui();

        if (!eGui.contains(e.relatedTarget as HTMLElement)) {
            const headerRow = this.getParentComponent() as HeaderRowComp;
            this.beans.focusController.setFocusedHeader(
                headerRow.getRowIndex(),
                this.getColumn()
            );
        }
    }

    private setupFloatingFilter(): void {
        const colDef = this.column.getColDef();

        if (colDef.filter && colDef.floatingFilter) {
            this.floatingFilterCompPromise = this.getFloatingFilterInstance();

            if (this.floatingFilterCompPromise) {
                this.floatingFilterCompPromise.then(compInstance => {
                    if (compInstance) {
                        this.setupWithFloatingFilter(compInstance);
                        this.setupSyncWithFilter();
                    } else {
                        this.setupEmpty();
                    }
                });
            } else {
                this.setupEmpty();
            }
        } else {
            this.setupEmpty();
        }
    }

    private setupLeftPositioning(): void {
        const setLeftFeature = new SetLeftFeature(this.column, this.getGui(), this.beans);
        this.createManagedBean(setLeftFeature);
    }

    private setupSyncWithFilter(): void {
        const syncWithFilter = (filterChangedEvent: FilterChangedEvent) => {
            const parentModel = this.getFilterComponent().resolveNow(null, filter => filter.getModel());
            this.onParentModelChanged(parentModel, filterChangedEvent);
        };

        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, syncWithFilter);

        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    }

    // linked to event listener in template
    private showParentFilter() {
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter, 'filterMenuTab', ['filterMenuTab']);
    }

    private setupColumnHover(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    }

    private onColumnHover(): void {
        addOrRemoveCssClass(this.getGui(), 'ag-column-hover', this.columnHoverService.isHovered(this.column));
    }

    private setupWidth(): void {
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = `${this.column.getActualWidth()}px`;
    }

    private setupWithFloatingFilter(floatingFilterComp: IFloatingFilterComp): void {
        const disposeFunc = () => {
            this.getContext().destroyBean(floatingFilterComp);
        };

        if (!this.isAlive()) {
            disposeFunc();
            return;
        }

        this.addDestroyFunc(disposeFunc);

        const floatingFilterCompUi = floatingFilterComp.getGui();

        addOrRemoveCssClass(this.eFloatingFilterBody, 'ag-floating-filter-body', !this.suppressFilterButton);
        addOrRemoveCssClass(this.eFloatingFilterBody, 'ag-floating-filter-full-body', this.suppressFilterButton);
        setDisplayed(this.eButtonWrapper, !this.suppressFilterButton);

        const eIcon = createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        this.eButtonShowMainFilter.appendChild(eIcon);

        this.eFloatingFilterBody.appendChild(floatingFilterCompUi);

        if (floatingFilterComp.afterGuiAttached) {
            floatingFilterComp.afterGuiAttached();
        }
    }

    private parentFilterInstance(callback: (filterInstance: IFilterComp) => void): void {
        this.getFilterComponent().then(callback);
    }

    private getFilterComponent(): Promise<IFilterComp> {
        return this.filterManager.getFilterComponent(this.column, 'NO_UI');
    }

    private getFloatingFilterInstance(): Promise<IFloatingFilterComp> {
        const colDef = this.column.getColDef();
        let defaultFloatingFilterType: string;

        if (typeof colDef.filter === 'string') {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterWrapper.filterToFloatingFilterNames[colDef.filter];
        } else if (colDef.filterFramework) {
            // If filterFramework, then grid is NOT using one of the provided filters, hence no default.
            // Note: We could combine this with another part of the 'if' statement, however explicitly
            // having this section makes the code easier to read.
        } else if (colDef.filter === true) {
            const setFilterModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
            defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }

        const filterParams = this.filterManager.createFilterParams(this.column, this.column.getColDef());
        const finalFilterParams = this.userComponentFactory.createFinalParams(colDef, 'filter', filterParams);

        const params: IFloatingFilterParams = {
            api: this.gridApi,
            column: this.column,
            filterParams: finalFilterParams,
            currentParentModel: this.currentParentModel.bind(this),
            parentFilterInstance: this.parentFilterInstance.bind(this),
            onFloatingFilterChanged: this.onFloatingFilterChanged.bind(this),
            suppressFilterButton: false // This one might be overridden from the colDef
        };

        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;

        let promise = this.userComponentFactory.newFloatingFilterComponent(colDef, params, defaultFloatingFilterType);

        if (!promise) {
            const filterComponent = this.getFilterComponentPrototype(colDef);
            const getModelAsStringExists = filterComponent && filterComponent.prototype && filterComponent.prototype.getModelAsString;

            if (getModelAsStringExists) {
                const compInstance =
                    this.userComponentFactory.createUserComponentFromConcreteClass(ReadOnlyFloatingFilter, params);

                promise = Promise.resolve(compInstance);
            }
        }

        return promise;
    }

    private createDynamicParams(): any {
        return {
            column: this.column,
            colDef: this.column.getColDef(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
    }

    private getFilterComponentPrototype(colDef: ColDef): { new(): any; } {
        const resolvedComponent = this.userComponentFactory.lookupComponentClassDef(colDef, 'filter', this.createDynamicParams());
        return resolvedComponent ? resolvedComponent.component : null;
    }

    private setupEmpty(): void {
        setDisplayed(this.eButtonWrapper, false);
    }

    private currentParentModel(): any {
        return this.getFilterComponent().resolveNow(null, filter => filter.getModel());
    }

    private onParentModelChanged(model: any, filterChangedEvent: FilterChangedEvent): void {
        if (!this.floatingFilterCompPromise) { return; }

        this.floatingFilterCompPromise.then(comp => comp.onParentModelChanged(model, filterChangedEvent));
    }

    private onFloatingFilterChanged(): void {
        console.warn('ag-Grid: since version 21.x, how floating filters are implemented has changed. ' +
            'Instead of calling params.onFloatingFilterChanged(), get a reference to the main filter via ' +
            'params.parentFilterInstance() and then set a value on the parent filter directly.');
    }
}
