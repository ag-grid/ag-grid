import {Component} from "../widgets/component";
import {Autowired, Context, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnGroup} from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";
import {Column} from "../entities/column";
import {DropTarget} from "../dragAndDrop/dragAndDropService";
import {RenderedHeaderCell} from "./deprecated/renderedHeaderCell";
import {EventService} from "../eventService";
import {Events} from "../events";
import {Utils as _} from "../utils";
import {HeaderWrapperComp} from "./header/headerWrapperComp";
import {HeaderGroupWrapperComp} from "./headerGroup/headerGroupWrapperComp";
import {FilterManager} from "../filter/filterManager";
import {BaseFilter} from "../filter/baseFilter";
import {ComponentProvider} from "../componentProvider";
import {IFloatingFilterWrapperComp} from "../filter/floatingFilterWrapper";
import {IComponent} from "../interfaces/iComponent";
import {FloatingFilterChange, IFloatingFilterParams} from "../filter/floatingFilter";

export enum HeaderRowType {
    COLUMN_GROUP, COLUMN, FLOATING_FILTER
}

export class HeaderRowComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('context') private context: Context;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('componentProvider') private componentProvider: ComponentProvider;

    private dept: number;
    private pinned: string;

    private headerComps: {[key: string]: IComponent<any>} = {};

    private eRoot: HTMLElement;
    private dropTarget: DropTarget;
    
    private type: HeaderRowType;

    constructor(dept: number, type: HeaderRowType, pinned: string, eRoot: HTMLElement, dropTarget: DropTarget) {
        super(`<div class="ag-header-row" role="presentation"/>`);
        this.dept = dept;
        this.type = type;
        this.pinned = pinned;
        this.eRoot = eRoot;
        this.dropTarget = dropTarget;
    }

    public forEachHeaderElement(callback: (comp: IComponent<any>)=>void): void {
        Object.keys(this.headerComps).forEach( key => {
            let headerElement = this.headerComps[key];
            callback(headerElement);
        });
    }

    public destroy(): void {
        let idsOfAllChildren = Object.keys(this.headerComps);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
        super.destroy();
    }

    private removeAndDestroyChildComponents(idsToDestroy: string[]): void {
        idsToDestroy.forEach( id => {
            let child = this.headerComps[id];
            this.getGui().removeChild(child.getGui());
            if (child.destroy){
                child.destroy();
            }
            delete this.headerComps[id];
        });
    }

    private onRowHeightChanged(): void {
        let headerRowCount = this.columnController.getHeaderRowCount();
        let sizes:number[]=[];

        let numberOfFloating = 0;
        let groupHeight:number;
        let headerHeight:number;
        if (!this.columnController.isPivotMode()){
            if (this.gridOptionsWrapper.isFloatingFilter()){
                headerRowCount ++;
            }
            numberOfFloating = (this.gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }else{
            numberOfFloating = 0;
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        let numberOfNonGroups = 1 + numberOfFloating;
        let numberOfGroups = headerRowCount - numberOfNonGroups;

        for (let i=0; i<numberOfGroups; i++) sizes.push(groupHeight);
        sizes.push(headerHeight);
        for (let i=0; i<numberOfFloating; i++) sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight());

        let rowHeight = 0;
        for (let i=0; i<this.dept; i++) rowHeight+=sizes[i];

        this.getGui().style.top = rowHeight + 'px';
        this.getGui().style.height = sizes[this.dept] + 'px';
    }

    //noinspection JSUnusedLocalSymbols
    @PostConstruct
    private init(): void {

        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this) );
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this) );

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this) );
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this) );

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this) );

        this.addDestroyableEventListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this) );
    }

    private onColumnResized(): void {
        this.setWidth();
    }

    private setWidth(): void {
        let mainRowWidth = this.columnController.getContainerWidth(this.pinned) + 'px';
        this.getGui().style.width = mainRowWidth;
    }

    private onGridColumnsChanged(): void {
        this.removeAndDestroyAllChildComponents();
    }

    private removeAndDestroyAllChildComponents(): void {
        let idsOfAllChildren = Object.keys(this.headerComps);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
    }

    private onDisplayedColumnsChanged(): void {
        this.onVirtualColumnsChanged();
        this.setWidth();
    }
    
    private onVirtualColumnsChanged(): void {

        let currentChildIds = Object.keys(this.headerComps);

        let itemsAtDepth = this.columnController.getVirtualHeaderGroupRow(
            this.pinned,
            this.type == HeaderRowType.FLOATING_FILTER ?
                this.dept -1 :
                this.dept
        );

        let ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        let eBefore: HTMLElement;

        itemsAtDepth.forEach( (child: ColumnGroupChild) => {
            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child.isEmptyGroup()) { return; }

            let idOfChild = child.getUniqueId();
            let eParentContainer = this.getGui();

            // if we already have this cell rendered, do nothing
            let colAlreadyInDom = currentChildIds.indexOf(idOfChild) >= 0;
            let headerComp: IComponent<any>;
            if (colAlreadyInDom) {
                _.removeFromArray(currentChildIds, idOfChild);
                headerComp = this.headerComps[idOfChild];
                if (ensureDomOrder) {
                    _.ensureDomOrder(eParentContainer, headerComp.getGui(), eBefore);
                }
            } else {
                headerComp = this.createHeaderComp(child);
                this.headerComps[idOfChild] = headerComp;
                if (ensureDomOrder) {
                    _.insertWithDomOrder(eParentContainer, headerComp.getGui(), eBefore);
                } else {
                    eParentContainer.appendChild(headerComp.getGui());
                }
            }
            eBefore = headerComp.getGui();
        });

        // at this point, anything left in currentChildIds is an element that is no longer in the viewport
        this.removeAndDestroyChildComponents(currentChildIds);
    }

    // check if user is using the deprecated
    private isUsingOldHeaderRenderer(column: Column): boolean {
        let colDef = column.getColDef();

        return _.anyExists([
            // header template
            this.gridOptionsWrapper.getHeaderCellTemplateFunc(),
            this.gridOptionsWrapper.getHeaderCellTemplate(),
            colDef.headerCellTemplate,
            // header cellRenderer
            colDef.headerCellRenderer,
            this.gridOptionsWrapper.getHeaderCellRenderer()
        ]);

    }

    private createHeaderComp(columnGroupChild:ColumnGroupChild): IComponent<any> {
        let result: IComponent<any>;

        switch (this.type) {
            case HeaderRowType.COLUMN :
                if (this.isUsingOldHeaderRenderer(<Column> columnGroupChild)) {
                    result = new RenderedHeaderCell(<Column> columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                } else {
                    result = new HeaderWrapperComp(<Column> columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                }
                break;
            case HeaderRowType.COLUMN_GROUP :
                result = new HeaderGroupWrapperComp(<ColumnGroup> columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                break;
            case HeaderRowType.FLOATING_FILTER :
                let column = <Column> columnGroupChild;
                result = this.createFloatingFilterWrapper(column);
                break;
        }


        this.context.wireBean(result);
        return result;
    }

    private createFloatingFilterWrapper(column: Column):IFloatingFilterWrapperComp<any, any, any, any> {
        let floatingFilterParams: IFloatingFilterParams<any, any> = this.createFloatingFilterParams(column);

        let floatingFilterWrapper: IFloatingFilterWrapperComp<any, any, any, any> = this.componentProvider.newFloatingFilterWrapperComponent(
            column,
            <null>floatingFilterParams
        );
        this.addDestroyableEventListener(column, Column.EVENT_FILTER_CHANGED, () => {
            let filterComponent: BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
            floatingFilterWrapper.onParentModelChanged(filterComponent.getModel());
        });
        let cachedFilter = <any>this.filterManager.cachedFilter(column);
        if (cachedFilter){
            let filterComponent: BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
            floatingFilterWrapper.onParentModelChanged(filterComponent.getModel());
        }
        return floatingFilterWrapper;
    }

    private createFloatingFilterParams<M, F extends FloatingFilterChange>(column: Column):IFloatingFilterParams<M, F> {
        // We always get the freshest reference to the baseFilter because the filters get sometimes created
        // and destroyed between calls
        //
        // let filterComponent:BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
        //
        let baseParams:IFloatingFilterParams<M, F> = {
            column:column,
            currentParentModel: (): M => {
                let filterComponent: BaseFilter<any, any, M> = <any>this.filterManager.getFilterComponent(column);
                return (filterComponent.getNullableModel) ?
                    filterComponent.getNullableModel() :
                    filterComponent.getModel();
            },
            onFloatingFilterChanged: (change: F|M): boolean => {
                let filterComponent: BaseFilter<any, any, M> = <any>this.filterManager.getFilterComponent(column);
                if (filterComponent.onFloatingFilterChanged){
                    //If going through this branch of code the user MUST
                    //be passing an object of type change that contains
                    //a model propery inside and some other stuff
                    return filterComponent.onFloatingFilterChanged(<F>change);
                } else {
                    //If going through this branch of code the user MUST
                    //be passing the plain model and delegating to ag-Grid
                    //the responsibility to set the parent model and refresh
                    //the filters
                    filterComponent.setModel(<M>change);
                    this.filterManager.onFilterChanged();
                    return true;
                }
            },
            //This one might be overriden from the colDef
            suppressFilterButton: false
        };
        return baseParams;
    }

}