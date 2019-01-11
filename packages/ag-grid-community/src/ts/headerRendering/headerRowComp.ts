import { Component } from "../widgets/component";
import { Autowired, Context, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { ColumnGroup } from "../entities/columnGroup";
import { ColumnController } from "../columnController/columnController";
import { Column } from "../entities/column";
import { DropTarget } from "../dragAndDrop/dragAndDropService";
import { EventService } from "../eventService";
import { Events } from "../events";
import { HeaderWrapperComp } from "./header/headerWrapperComp";
import { HeaderGroupWrapperComp } from "./headerGroup/headerGroupWrapperComp";
import { FilterManager } from "../filter/filterManager";
import { IFloatingFilterWrapperComp } from "../filter/floatingFilterWrapper";
import { IComponent } from "../interfaces/iComponent";
import { FloatingFilterChange, IFloatingFilterParams } from "../filter/floatingFilter";
import { ComponentRecipes } from "../components/framework/componentRecipes";
import { IFilterComp } from "../interfaces/iFilter";
import { GridApi } from "../gridApi";
import { CombinedFilter } from "../filter/baseFilter";
import { Constants } from "../constants";
import { Promise, _ } from "../utils";

export enum HeaderRowType {
    COLUMN_GROUP, COLUMN, FLOATING_FILTER
}

export class HeaderRowComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('context') private context: Context;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;

    private readonly dept: number;
    private readonly pinned: string;

    private readonly dropTarget: DropTarget;
    private readonly type: HeaderRowType;

    private headerComps: { [key: string]: IComponent<any> } = {};

    constructor(dept: number, type: HeaderRowType, pinned: string, dropTarget: DropTarget) {
        super(`<div class="ag-header-row" role="presentation"/>`);
        this.dept = dept;
        this.type = type;
        this.pinned = pinned;
        this.dropTarget = dropTarget;
    }

    public forEachHeaderElement(callback: (comp: IComponent<any>) => void): void {
        Object.keys(this.headerComps).forEach(key => {
            callback(this.headerComps[key]);
        });
    }

    public destroy(): void {
        const idsOfAllChildren = Object.keys(this.headerComps);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
        super.destroy();
    }

    private removeAndDestroyChildComponents(idsToDestroy: string[]): void {
        idsToDestroy.forEach(id => {
            const childHeaderComp: IComponent<any> = this.headerComps[id];
            this.getGui().removeChild(childHeaderComp.getGui());
            if (childHeaderComp.destroy) {
                childHeaderComp.destroy();
            }
            delete this.headerComps[id];
        });
    }

    private onRowHeightChanged(): void {
        let headerRowCount = this.columnController.getHeaderRowCount();
        const sizes: number[] = [];

        let numberOfFloating = 0;
        let groupHeight: number;
        let headerHeight: number;
        if (!this.columnController.isPivotMode()) {
            if (this.gridOptionsWrapper.isFloatingFilter()) {
                headerRowCount++;
            }
            numberOfFloating = (this.gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        } else {
            numberOfFloating = 0;
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        for (let i = 0; i < numberOfGroups; i++) { sizes.push(groupHeight); }
        sizes.push(headerHeight);
        for (let i = 0; i < numberOfFloating; i++) { sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight()); }

        let rowHeight = 0;
        for (let i = 0; i < this.dept; i++) { rowHeight += sizes[i]; }

        this.getGui().style.top = rowHeight + 'px';
        this.getGui().style.height = sizes[this.dept] + 'px';
    }

    //noinspection JSUnusedLocalSymbols
    @PostConstruct
    private init(): void {

        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    }

    private onColumnResized(): void {
        this.setWidth();
    }

    private setWidth(): void {
        const width = this.getWidthForRow();
        this.getGui().style.width = width + 'px';
    }

    private getWidthForRow(): number {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (printLayout) {
            const centerRow = _.missing(this.pinned);
            if (centerRow) {
                return this.columnController.getContainerWidth(Column.PINNED_RIGHT)
                    + this.columnController.getContainerWidth(Column.PINNED_LEFT)
                    + this.columnController.getContainerWidth(null);
            } else {
                return 0;
            }
        } else {
            // if not printing, just return the width as normal
            return this.columnController.getContainerWidth(this.pinned);
        }
    }

    private onGridColumnsChanged(): void {
        this.removeAndDestroyAllChildComponents();
    }

    private removeAndDestroyAllChildComponents(): void {
        const idsOfAllChildren = Object.keys(this.headerComps);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
    }

    private onDisplayedColumnsChanged(): void {
        this.onVirtualColumnsChanged();
        this.setWidth();
    }

    private getItemsAtDept(): ColumnGroupChild[] {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (printLayout) {
            // for print layout, we add all columns into the center
            const centerContainer = _.missing(this.pinned);
            if (centerContainer) {
                let result: ColumnGroupChild[] = [];
                [Column.PINNED_LEFT, null, Column.PINNED_RIGHT].forEach(pinned => {
                    const items = this.columnController.getVirtualHeaderGroupRow(
                        pinned,
                        this.type == HeaderRowType.FLOATING_FILTER ?
                            this.dept - 1 :
                            this.dept
                    );
                    result = result.concat(items);
                });
                return result;
            } else {
                return [];
            }
        } else {
            // when in normal layout, we add the columns for that container only
            return this.columnController.getVirtualHeaderGroupRow(
                this.pinned,
                this.type == HeaderRowType.FLOATING_FILTER ?
                    this.dept - 1 :
                    this.dept
            );
        }
    }

    private onVirtualColumnsChanged(): void {

        const currentChildIds = Object.keys(this.headerComps);

        const itemsAtDepth = this.getItemsAtDept();
        const ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        let eBefore: HTMLElement;

        itemsAtDepth.forEach((child: ColumnGroupChild) => {
            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child.isEmptyGroup()) {
                return;
            }

            const idOfChild = child.getUniqueId();
            const eParentContainer = this.getGui();

            // if we already have this cell rendered, do nothing
            const colAlreadyInDom = currentChildIds.indexOf(idOfChild) >= 0;
            let headerComp: IComponent<any>;
            let eHeaderCompGui: HTMLElement;
            if (colAlreadyInDom) {
                _.removeFromArray(currentChildIds, idOfChild);
                headerComp = this.headerComps[idOfChild];
                eHeaderCompGui = headerComp.getGui();
                if (ensureDomOrder) {
                    _.ensureDomOrder(eParentContainer, eHeaderCompGui, eBefore);
                }
                eBefore = eHeaderCompGui;
            } else {
                headerComp = this.createHeaderComp(child);
                this.headerComps[idOfChild] = headerComp;
                eHeaderCompGui = headerComp.getGui();
                if (ensureDomOrder) {
                    _.insertWithDomOrder(eParentContainer, eHeaderCompGui, eBefore);
                } else {
                    eParentContainer.appendChild(eHeaderCompGui);
                }
                eBefore = eHeaderCompGui;
            }
        });

        // at this point, anything left in currentChildIds is an element that is no longer in the viewport
        this.removeAndDestroyChildComponents(currentChildIds);
    }

    private createHeaderComp(columnGroupChild: ColumnGroupChild): IComponent<any> {
        let result: IComponent<any>;

        switch (this.type) {
            case HeaderRowType.COLUMN :
                result = new HeaderWrapperComp(columnGroupChild as Column, this.dropTarget, this.pinned);
                break;
            case HeaderRowType.COLUMN_GROUP :
                result = new HeaderGroupWrapperComp(columnGroupChild as ColumnGroup, this.dropTarget, this.pinned);
                break;
            case HeaderRowType.FLOATING_FILTER :
                const column = columnGroupChild as Column;
                result = this.createFloatingFilterWrapper(column);
                break;
        }

        this.context.wireBean(result);

        return result;
    }

    private createFloatingFilterWrapper(column: Column): IFloatingFilterWrapperComp<any, any, any, any> {
        const floatingFilterParams: IFloatingFilterParams<any, any> = this.createFloatingFilterParams(column);

        const floatingFilterWrapper: IFloatingFilterWrapperComp<any, any, any, any> = this.componentRecipes.newFloatingFilterWrapperComponent(
            column,
            floatingFilterParams as null
        );

        this.addDestroyableEventListener(column, Column.EVENT_FILTER_CHANGED, () => {
            const filterComponentPromise: Promise<IFilterComp> = this.filterManager.getFilterComponent(column, 'NO_UI');
            floatingFilterWrapper.onParentModelChanged(filterComponentPromise.resolveNow(null, filter => filter.getModel()));
        });
        const cachedFilter = this.filterManager.cachedFilter(column) as any;
        if (cachedFilter) {
            const filterComponentPromise: Promise<IFilterComp> = this.filterManager.getFilterComponent(column, 'NO_UI');
            floatingFilterWrapper.onParentModelChanged(filterComponentPromise.resolveNow(null, filter => filter.getModel()));
        }

        return floatingFilterWrapper;
    }

    private createFloatingFilterParams<M, F extends FloatingFilterChange>(column: Column): IFloatingFilterParams<M, F> {
        // We always get the freshest reference to the baseFilter because the filters get sometimes created
        // and destroyed between calls
        //
        // let filterComponent:BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
        //
        const baseParams: IFloatingFilterParams<M, F> = {
            api: this.gridApi,
            column: column,
            currentParentModel: (): M => {
                const filterComponentPromise: Promise<IFilterComp> = this.filterManager.getFilterComponent(column, 'NO_UI') as any;
                const wholeParentFilter: CombinedFilter<M> | M = filterComponentPromise.resolveNow(null, (filter: any) =>
                    (filter.getNullableModel) ?
                        filter.getNullableModel() :
                        filter.getModel()
                );
                return (wholeParentFilter && (wholeParentFilter as CombinedFilter<M>).operator != null) ? (wholeParentFilter as CombinedFilter<M>).condition1 : wholeParentFilter as M;
            },
            onFloatingFilterChanged: (change: F | M): boolean => {
                let captureModelChangedResolveFunc: (modelChanged: boolean) => void;
                const modelChanged: Promise<boolean> = new Promise((resolve) => {
                    captureModelChangedResolveFunc = resolve;
                });
                const filterComponentPromise: Promise<IFilterComp> = this.filterManager.getFilterComponent(column, 'NO_UI') as any;
                filterComponentPromise.then(filterComponent => {
                    if (filterComponent.onFloatingFilterChanged) {
                        //If going through this branch of code the user MUST
                        //be passing an object of type change that contains
                        //a model propery inside and some other stuff
                        const result: boolean = filterComponent.onFloatingFilterChanged(change as F);
                        captureModelChangedResolveFunc(result);
                    } else {
                        //If going through this branch of code the user MUST
                        //be passing the plain model and delegating to ag-Grid
                        //the responsibility to set the parent model and refresh
                        //the filters
                        filterComponent.setModel(change as M);
                        this.filterManager.onFilterChanged();
                        captureModelChangedResolveFunc(true);
                    }
                });
                return modelChanged.resolveNow(true, changed => changed);
            },
            //This one might be overriden from the colDef
            suppressFilterButton: false
        };
        return baseParams;
    }

}