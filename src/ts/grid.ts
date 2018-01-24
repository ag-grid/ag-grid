import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {SelectionController} from "./selectionController";
import {ColumnApi} from "./columnController/columnApi";
import {ColumnController} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {FilterManager} from "./filter/filterManager";
import {ValueService} from "./valueService/valueService";
import {EventService} from "./eventService";
import {GridPanel} from "./gridPanel/gridPanel";
import {GridApi} from "./gridApi";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {ExpressionService} from "./valueService/expressionService";
import {TemplateService} from "./templateService";
import {PopupService} from "./widgets/popupService";
import {Logger, LoggerFactory} from "./logger";
import {ColumnUtils} from "./columnController/columnUtils";
import {AutoWidthCalculator} from "./rendering/autoWidthCalculator";
import {HorizontalDragService} from "./headerRendering/horizontalDragService";
import {Context} from "./context/context";
import {CsvCreator} from "./csvCreator";
import {GridCore} from "./gridCore";
import {StandardMenuFactory} from "./headerRendering/standardMenu";
import {DragAndDropService} from "./dragAndDrop/dragAndDropService";
import {DragService} from "./dragAndDrop/dragService";
import {SortController} from "./sortController";
import {FocusedCellController} from "./focusedCellController";
import {MouseEventService} from "./gridPanel/mouseEventService";
import {CellNavigationService} from "./cellNavigationService";
import {NumberSequence, Utils as _} from "./utils";
import {FilterStage} from "./rowModels/inMemory/filterStage";
import {SortStage} from "./rowModels/inMemory/sortStage";
import {FlattenStage} from "./rowModels/inMemory/flattenStage";
import {CellEditorFactory} from "./rendering/cellEditorFactory";
import {Events, GridReadyEvent} from "./events";
import {InfiniteRowModel} from "./rowModels/infinite/infiniteRowModel";
import {InMemoryRowModel} from "./rowModels/inMemory/inMemoryRowModel";
import {CellRendererFactory} from "./rendering/cellRendererFactory";
import {CellRendererService} from "./rendering/cellRendererService";
import {ValueFormatterService} from "./rendering/valueFormatterService";
import {AgCheckbox} from "./widgets/agCheckbox";
import {BaseFrameworkFactory} from "./baseFrameworkFactory";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {ScrollVisibleService} from "./gridPanel/scrollVisibleService";
import {Downloader} from "./downloader";
import {XmlFactory} from "./xmlFactory";
import {GridSerializer} from "./gridSerializer";
import {StylingService} from "./styling/stylingService";
import {ColumnHoverService} from "./rendering/columnHoverService";
import {ColumnAnimationService} from "./rendering/columnAnimationService";
import {SortService} from "./rowNodes/sortService";
import {FilterService} from "./rowNodes/filterService";
import {RowNodeFactory} from "./rowNodes/rowNodeFactory";
import {AutoGroupColService} from "./columnController/autoGroupColService";
import {PaginationAutoPageSizeService, PaginationProxy} from "./rowModels/paginationProxy";
import {ImmutableService} from "./rowModels/inMemory/immutableService";
import {IRowModel} from "./interfaces/iRowModel";
import {Constants} from "./constants";
import {ValueCache} from "./valueService/valueCache";
import {ChangeDetectionService} from "./valueService/changeDetectionService";
import {AlignedGridsService} from "./alignedGridsService";
import {PinnedRowModel} from "./rowModels/pinnedRowModel";
import {ComponentResolver} from "./components/framework/componentResolver";
import {ComponentRecipes} from "./components/framework/componentRecipes";
import {ComponentProvider} from "./components/framework/componentProvider";
import {AgComponentUtils} from "./components/framework/agComponentUtils";
import {ComponentMetadataProvider} from "./components/framework/componentMetadataProvider";
import {Beans} from "./rendering/beans";
import {Environment} from "./environment";
import {AnimationFrameService} from "./misc/animationFrameService";
import {NavigationService} from "./gridPanel/navigationService";

export interface GridParams {
    // used by Web Components
    globalEventListener?: Function;

    // these are used by ng1 only
    $scope?: any;
    $compile?: any;
    quickFilterOnScope?: any;

    // this allows the base frameworks (React, NG2, etc) to provide alternative cellRenderers and cellEditors
    frameworkFactory?: IFrameworkFactory;

    //bean instances to add to the context
    seedBeanInstances?: {[key:string]:any}
}

export class Grid {

    private context: Context;

    private static enterpriseBeans: any[];
    private static frameworkBeans: any[];

    // the default is InMemoryRowModel, which is also used for pagination.
    // the enterprise adds viewport to this list.
    private static RowModelClasses: any = {
        infinite: InfiniteRowModel,
        inMemory: InMemoryRowModel
    };

    public static setEnterpriseBeans(enterpriseBeans: any[], rowModelClasses: any): void {
        this.enterpriseBeans = enterpriseBeans;

        // the enterprise can inject additional row models. this is how it injects the viewportRowModel
        _.iterateObject(rowModelClasses, (key: string, value: any)=> Grid.RowModelClasses[key] = value );
    }

    public static setFrameworkBeans(frameworkBeans: any[]): void {
        this.frameworkBeans = frameworkBeans;
    }

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams) {

        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
        }
        
        let rowModelClass = this.getRowModelClass(gridOptions);

        let enterprise = _.exists(Grid.enterpriseBeans);

        let frameworkFactory = params ? params.frameworkFactory : null;
        if (_.missing(frameworkFactory)) {
            frameworkFactory = new BaseFrameworkFactory();
        }

        let overrideBeans:any[]= [];

        if (Grid.enterpriseBeans){
            overrideBeans = overrideBeans.concat(Grid.enterpriseBeans);
        }

        if (Grid.frameworkBeans){
            overrideBeans = overrideBeans.concat(Grid.frameworkBeans);
        }

        let seed = {
            enterprise: enterprise,
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            $scope: params ? params.$scope : null,
            $compile: params ? params.$compile : null,
            quickFilterOnScope: params ? params.quickFilterOnScope : null,
            globalEventListener: params ? params.globalEventListener : null,
            frameworkFactory: frameworkFactory
        };
        if (params && params.seedBeanInstances) {
            _.assign(seed, params.seedBeanInstances);
        }

        let contextParams = {
            overrideBeans: overrideBeans,
            seed: seed,
            //Careful with the order of the beans here, there are dependencies between them that need to be kept
            beans: [rowModelClass, PaginationAutoPageSizeService, GridApi, ComponentProvider, AgComponentUtils, ComponentMetadataProvider,
                ComponentProvider, ComponentResolver, ComponentRecipes,
                CellRendererFactory, HorizontalDragService, PinnedRowModel, DragService,
                DisplayedGroupCreator, EventService, GridOptionsWrapper, SelectionController,
                FilterManager, ColumnController, PaginationProxy, RowRenderer, HeaderRenderer, ExpressionService,
                BalancedColumnTreeBuilder, CsvCreator, Downloader, XmlFactory, GridSerializer, TemplateService,
                NavigationService, GridPanel, PopupService, ValueCache, ValueService, AlignedGridsService,
                LoggerFactory, ColumnUtils, AutoWidthCalculator, PopupService, GridCore, StandardMenuFactory,
                DragAndDropService, ColumnApi, FocusedCellController, MouseEventService,
                CellNavigationService, FilterStage, SortStage, FlattenStage, FilterService, RowNodeFactory,
                CellEditorFactory, CellRendererService, ValueFormatterService, StylingService, ScrollVisibleService,
                ColumnHoverService, ColumnAnimationService, SortService, AutoGroupColService, ImmutableService,
                ChangeDetectionService, Environment, Beans, AnimationFrameService, SortController],
            components: [
                {componentName: 'AgCheckbox', theClass: AgCheckbox}
            ],
            debug: !!gridOptions.debug
        };

        let isLoggingFunc = ()=> contextParams.debug;
        this.context = new Context(contextParams, new Logger('Context', isLoggingFunc));

        this.setColumnsAndData();

        this.dispatchGridReadyEvent(gridOptions);

        if (gridOptions.debug) {
            console.log('ag-Grid -> initialised successfully, enterprise = ' + enterprise);
        }
    }

    private setColumnsAndData(): void {

        let gridOptionsWrapper: GridOptionsWrapper = this.context.getBean('gridOptionsWrapper');
        let columnController: ColumnController = this.context.getBean('columnController');
        let rowModel: IRowModel = this.context.getBean('rowModel');

        let columnDefs = gridOptionsWrapper.getColumnDefs();
        let rowData = gridOptionsWrapper.getRowData();

        let nothingToSet = _.missing(columnDefs) && _.missing(rowData);
        if (nothingToSet) { return; }

        let valueService: ValueService = this.context.getBean('valueService');

        if (_.exists(columnDefs)) {
            columnController.setColumnDefs(columnDefs, "gridInitializing");
        }

        if (_.exists(rowData) && rowModel.getType()===Constants.ROW_MODEL_TYPE_IN_MEMORY) {
            let inMemoryRowModel = <InMemoryRowModel> rowModel;
            inMemoryRowModel.setRowData(rowData);
        }
    }

    private dispatchGridReadyEvent(gridOptions: GridOptions): void {
        let eventService: EventService = this.context.getBean('eventService');
        let readyEvent: GridReadyEvent = {
            type: Events.EVENT_GRID_READY,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        eventService.dispatchEvent(readyEvent);
    }

    private getRowModelClass(gridOptions: GridOptions): any {
        let rowModelType = gridOptions.rowModelType;
        if (_.exists(rowModelType)) {
            let rowModelClass = Grid.RowModelClasses[rowModelType];
            if (_.exists(rowModelClass)) {
                return rowModelClass;
            } else {
                if (rowModelType==='normal') {
                    console.warn(`ag-Grid: normal rowModel deprecated. Should now be called inMemory rowModel instead.`);
                    return InMemoryRowModel;
                }
                console.error('ag-Grid: could not find matching row model for rowModelType ' + rowModelType);
                if (rowModelType==='viewport') {
                    console.error('ag-Grid: rowModelType viewport is only available in ag-Grid Enterprise');
                }
                if (rowModelType==='enterprise') {
                    console.error('ag-Grid: rowModelType viewport is only available in ag-Grid Enterprise');
                }
            }
        }
        return InMemoryRowModel;
    };

    public destroy(): void {
        this.context.destroy();
    }

}