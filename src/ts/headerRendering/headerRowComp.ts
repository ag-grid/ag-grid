import {Component} from "../widgets/component";
import {PostConstruct, Autowired, Context} from "../context/context";
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
import {IFloatingFilterParams, FloatingFilterChange} from "../filter/floatingFilter";

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

    private headerElements: {[key: string]: IComponent<any>} = {};

    private eRoot: HTMLElement;
    private dropTarget: DropTarget;
    
    private type: HeaderRowType;

    constructor(dept: number, type: HeaderRowType, pinned: string, eRoot: HTMLElement, dropTarget: DropTarget) {
        super(`<div class="ag-header-row"/>`);
        this.dept = dept;
        this.type = type;
        this.pinned = pinned;
        this.eRoot = eRoot;
        this.dropTarget = dropTarget;
    }

    public forEachHeaderElement(callback: (comp: IComponent<any>)=>void): void {
        Object.keys(this.headerElements).forEach( key => {
            var headerElement = this.headerElements[key];
            callback(headerElement);
        });
    }

    public destroy(): void {
        var idsOfAllChildren = Object.keys(this.headerElements);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
        super.destroy();
    }

    private removeAndDestroyChildComponents(idsToDestroy: string[]): void {
        idsToDestroy.forEach( id => {
            var child = this.headerElements[id];
            this.getGui().removeChild(child.getGui());
            if (child.destroy){
                child.destroy();
            }
            delete this.headerElements[id];
        });
    }

    private onRowHeightChanged(): void {
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        this.getGui().style.top = (this.dept * rowHeight) + 'px';
        this.getGui().style.height = rowHeight + 'px';
    }

    //noinspection JSUnusedLocalSymbols
    @PostConstruct
    private init(): void {

        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this) );
    }

    private onColumnResized(): void {
        this.setWidth();
    }

    private setWidth(): void {
        var mainRowWidth = this.columnController.getContainerWidth(this.pinned) + 'px';
        this.getGui().style.width = mainRowWidth;
    }

    private onGridColumnsChanged(): void {
        this.removeAndDestroyAllChildComponents();
    }

    private removeAndDestroyAllChildComponents(): void {
        var idsOfAllChildren = Object.keys(this.headerElements);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
    }

    private onDisplayedColumnsChanged(): void {
        this.onVirtualColumnsChanged();
        this.setWidth();
    }
    
    private onVirtualColumnsChanged(): void {

        var currentChildIds = Object.keys(this.headerElements);

        var itemsAtDepth = this.columnController.getVirtualHeaderGroupRow(
            this.pinned,
            this.type == HeaderRowType.FLOATING_FILTER ?
                this.dept -1 :
                this.dept
        );

        itemsAtDepth.forEach( (child: ColumnGroupChild) => {
            var idOfChild = child.getUniqueId();

            // if we already have this cell rendered, do nothing
            if (currentChildIds.indexOf(idOfChild) >= 0) {
                _.removeFromArray(currentChildIds, idOfChild);
                return;
            }

            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child instanceof ColumnGroup && (<ColumnGroup>child).getDisplayedChildren().length === 0) {
                return;
            }

            var renderedHeaderElement = this.createHeaderElement(child);
            this.headerElements[idOfChild] = renderedHeaderElement;
            this.getGui().appendChild(renderedHeaderElement.getGui());
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

    private createHeaderElement(columnGroupChild:ColumnGroupChild): IComponent<any> {
        var result: IComponent<any>;

        switch (this.type) {
            case HeaderRowType.COLUMN :
                if (this.isUsingOldHeaderRenderer(<Column> columnGroupChild)) {
                    ////// DEPRECATED - TAKE THIS OUT IN V9
                    if (!warningGiven) {
                        console.warn('ag-Grid: since v8, custom headers are now done using components. Please refer to the documentation https://www.ag-grid.com/javascript-grid-header-rendering/. Support for the old way will be dropped in v9.');
                        warningGiven = true;
                    }
                    result = new RenderedHeaderCell(<Column> columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                } else {
                    // the future!!!
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
        let filterComponent: BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
        let floatingFilterParams: IFloatingFilterParams<any, any> = this.createFloatingFilterParams(column);
        let floatingFilterWrapper: IFloatingFilterWrapperComp<any, any, any, any> = this.componentProvider.newFloatingFilterWrapperComponent(
            filterComponent,
            column,
            <null>floatingFilterParams
        );
        column.addEventListener(Column.EVENT_FILTER_CHANGED, () => {
            let filterComponent: BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
            floatingFilterWrapper.onParentModelChanged(filterComponent.getModel());
        });
        floatingFilterWrapper.onParentModelChanged(filterComponent.getModel());
        return floatingFilterWrapper;
    }

    private createFloatingFilterParams<M, F extends FloatingFilterChange>(column: Column):IFloatingFilterParams<M, F> {
        /** We always get the freshest reference to the baseFilter because the filters get sometimes created
         * and destroyed beetwen calls
         *
         *let filterComponent:BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
         */
        let baseParams:IFloatingFilterParams<M, F> = {
            currentParentModel: (): M => {
                let filterComponent: BaseFilter<any, any, M> = <any>this.filterManager.getFilterComponent(column);
                return (filterComponent.getNullableModel) ?
                    filterComponent.getNullableModel() :
                    filterComponent.getModel();
            },
            onFloatingFilterChanged: (change: F|M): void => {
                let filterComponent: BaseFilter<any, any, M> = <any>this.filterManager.getFilterComponent(column);
                if (filterComponent.onFloatingFilterChanged){
                    //If going through this branch of code the user MUST
                    //be passing an object of type change that contains
                    //a model propery inside and some other stuff
                    filterComponent.onFloatingFilterChanged(<F>change);
                } else {
                    //If going through this branch of code the user MUST
                    //be passing the plain model and delegating to ag-Grid
                    //the responsibility to set the parent model and refresh
                    //the filters
                    filterComponent.setModel(<M>change);
                    this.filterManager.onFilterChanged();
                }
            },
            //This one might be overriden from the colDef
            suppressFilterButton: false
        };
        return baseParams;
    }

}

// remove this in v9, when we take out support for the old headers
let warningGiven = false;