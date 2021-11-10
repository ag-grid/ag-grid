
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, Optional } from '../../../context/context';
import { Column } from '../../../entities/column';
import { Events, FilterChangedEvent } from '../../../events';
import { FilterManager } from '../../../filter/filterManager';
import { IFloatingFilter, IFloatingFilterComp, IFloatingFilterParams } from '../../../filter/floating/floatingFilter';
import { FloatingFilterMapper } from '../../../filter/floating/floatingFilterMapper';
import { ReadOnlyFloatingFilter } from '../../../filter/floating/provided/readOnlyFloatingFilter';
import { GridApi } from '../../../gridApi';
import { IFilterComp, IFilterDef } from '../../../interfaces/iFilter';
import { IMenuFactory } from '../../../interfaces/iMenuFactory';
import { ModuleNames } from '../../../modules/moduleNames';
import { ModuleRegistry } from '../../../modules/moduleRegistry';
import { Beans } from '../../../rendering/beans';
import { ColumnHoverService } from '../../../rendering/columnHoverService';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { AgPromise } from '../../../utils';
import { addOrRemoveCssClass, setDisplayed } from '../../../utils/dom';
import { createIconNoSpan } from '../../../utils/icon';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import { HoverFeature } from '../hoverFeature';
import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { FrameworkComponentWrapper } from "../../../components/framework/frameworkComponentWrapper";

export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveBodyCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveButtonWrapperCssClass(cssClassName: string, on: boolean): void;
    setCompDetails(compDetails: UserCompDetails): void;
    getFloatingFilterComp(): AgPromise<IFloatingFilter> | null;
    setWidth(width: string): void;
    setMenuIcon(icon: HTMLElement): void;
}

export class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl {

    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnHoverService') private readonly columnHoverService: ColumnHoverService;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('menuFactory') private readonly menuFactory: IMenuFactory;
    @Autowired('beans') protected readonly beans: Beans;
    @Optional('frameworkComponentWrapper') private frameworkComponentWrapper: FrameworkComponentWrapper;

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
        // const active = !(!(colDef.filter && colDef.floatingFilter) && !(colDef.filterFramework && colDef.floatingFilterComponentFramework));
        this.active = (!!colDef.filter || !!colDef.filterFramework) && !!colDef.floatingFilter;

        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();

        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    }

    private setupUi(): void {

        this.comp.addOrRemoveButtonWrapperCssClass('ag-hidden', !this.active || this.suppressFilterButton);

        if (!this.active) { return; }

        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);
        
        const eMenuIcon = createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        eMenuIcon && this.eButtonShowMainFilter.appendChild(eMenuIcon);        
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

    protected onTabKeyDown(e: KeyboardEvent) {
        const activeEl = document.activeElement as HTMLElement;
        const wrapperHasFocus = activeEl === this.eGui;

        if (wrapperHasFocus) { return; }

        const nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);

        if (nextFocusableEl) {
            e.preventDefault();
            nextFocusableEl.focus();
        }
    }

    protected handleKeyDown(e: KeyboardEvent) {
        const activeEl = document.activeElement;
        const wrapperHasFocus = activeEl === this.eGui;

        switch (e.keyCode) {
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

    protected onFocusIn(e: FocusEvent): void {
        const fromWithin = this.eGui.contains(e.relatedTarget as HTMLElement);

        // when the focus is already within the component,
        // we default to the browser's behavior
        if (fromWithin) { return; }

        if (e.target === this.eGui) { 
            const keyboardMode = this.focusService.isKeyboardMode();
            const currentFocusedHeader = this.beans.focusService.getFocusedHeader();

            const nextColumn = this.beans.columnModel.getDisplayedColAfter(this.column);

            const lastFocusEvent = this.lastFocusEvent;
            const fromShiftTab = !!(lastFocusEvent && lastFocusEvent.shiftKey && lastFocusEvent.keyCode === KeyCode.TAB);
            const fromNextColumn = !!(currentFocusedHeader && nextColumn === currentFocusedHeader.column);
    
            const shouldFocusLast = keyboardMode && (fromShiftTab || fromNextColumn);
            this.focusService.focusInto(this.eGui, shouldFocusLast);
         }

         const rowIndex = this.getRowIndex();
         this.beans.focusService.setFocusedHeader(rowIndex, this.column);
    }

    private setupHover(): void {
        this.createManagedBean(new HoverFeature([this.column], this.eGui));

        const listener = ()=> {
            if (!this.gridOptionsWrapper.isColumnHoverHighlight()) { return; }
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

        const filterParams = this.filterManager.createFilterParams(this.column, colDef);
        const finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, 'filter', filterParams);

        let defaultFloatingFilterType = HeaderFilterCellCtrl.getDefaultFloatingFilterType(colDef);
        if (defaultFloatingFilterType==null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }

        const params: IFloatingFilterParams = {
            api: this.gridApi,
            column: this.column,
            filterParams: finalFilterParams,
            currentParentModel: this.currentParentModel.bind(this),
            parentFilterInstance: this.parentFilterInstance.bind(this),
            showParentFilter: this.showParentFilter.bind(this),
            onFloatingFilterChanged: this.onFloatingFilterChanged.bind(this),
            suppressFilterButton: false // This one might be overridden from the colDef
        };

        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;

        const compDetails = this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
        if (compDetails) {
            this.comp.setCompDetails(compDetails);
        }
    }

    public static getDefaultFloatingFilterType(def: IFilterDef): string | null {
        if (def == null) { return null; }

        let defaultFloatingFilterType: string | null = null;

        if (typeof def.filter === 'string') {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterMapper.getFloatingFilterType(def.filter);
        } else if (def.filterFramework) {
            // If filterFramework, then grid is NOT using one of the provided filters, hence no default.
            // Note: We could combine this with another part of the 'if' statement, however explicitly
            // having this section makes the code easier to read.
        } else if (def.filter === true) {
            const setFilterModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
            defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }

        return defaultFloatingFilterType;
    }

    private currentParentModel(): any {
        const filterComponent = this.getFilterComponent(false);

        return filterComponent ? filterComponent.resolveNow(null, filter => filter && filter.getModel()) : null;
    }

    private getFilterComponent(createIfDoesNotExist = true): AgPromise<IFilterComp> | null {
        return this.filterManager.getFilterComponent(this.column, 'NO_UI', createIfDoesNotExist);
    }

    private onFloatingFilterChanged(): void {
        console.warn('AG Grid: since version 21.x, how floating filters are implemented has changed. ' +
            'Instead of calling params.onFloatingFilterChanged(), get a reference to the main filter via ' +
            'params.parentFilterInstance() and then set a value on the parent filter directly.');
    }

    private parentFilterInstance(callback: (filterInstance: IFilterComp) => void): void {
        const filterComponent = this.getFilterComponent();

        if (filterComponent) {
            filterComponent.then( instance => {
                const instanceUnwrapped = this.frameworkComponentWrapper ? this.frameworkComponentWrapper.unwrap(instance) : instance;
                callback(instanceUnwrapped);
            });
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
            const parentModel = this.currentParentModel();
            compPromise.then(comp => comp && comp.onParentModelChanged(parentModel, filterChangedEvent));
        };

        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, syncWithFilter);

        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    }

    private setupWidth(): void {
        const listener = ()=> {
            const width = `${this.column.getActualWidth()}px`;
            this.comp.setWidth(width)
        };

        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }

}
