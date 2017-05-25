import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {FloatingRowModel} from "./rowModels/floatingRowModel";
import {SelectionController} from "./selectionController";
import {ColumnController, ColumnApi} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {FilterManager} from "./filter/filterManager";
import {ValueService} from "./valueService";
import {MasterSlaveService} from "./masterSlaveService";
import {EventService} from "./eventService";
import {GridPanel} from "./gridPanel/gridPanel";
import {GridApi} from "./gridApi";
import {HeaderTemplateLoader} from "./headerRendering/deprecated/headerTemplateLoader";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {ExpressionService} from "./expressionService";
import {TemplateService} from "./templateService";
import {PopupService} from "./widgets/popupService";
import {LoggerFactory, Logger} from "./logger";
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
import {Utils as _} from "./utils";
import {FilterStage} from "./rowModels/inMemory/filterStage";
import {SortStage} from "./rowModels/inMemory/sortStage";
import {FlattenStage} from "./rowModels/inMemory/flattenStage";
import {FocusService} from "./misc/focusService";
import {CellEditorFactory} from "./rendering/cellEditorFactory";
import {Events} from "./events";
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
import {ComponentProvider} from "./componentProvider";
import {SortService} from "./rowNodes/sortService";
import {FilterService} from "./rowNodes/filterService";
import {RowNodeFactory} from "./rowNodes/rowNodeFactory";
import {AutoGroupColService} from "./columnController/autoGroupColService";
import {PaginationAutoPageSizeService, PaginationProxy} from "./rowModels/paginationProxy";
import {ImmutableService} from "./rowModels/inMemory/immutableService";


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
        normal: InMemoryRowModel
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
            beans: [rowModelClass, PaginationAutoPageSizeService, GridApi, ComponentProvider, CellRendererFactory, HorizontalDragService, HeaderTemplateLoader, FloatingRowModel, DragService,
                DisplayedGroupCreator, EventService, GridOptionsWrapper, SelectionController,
                FilterManager, ColumnController, PaginationProxy, RowRenderer,
                HeaderRenderer, ExpressionService, BalancedColumnTreeBuilder, CsvCreator, Downloader, XmlFactory,
                GridSerializer, TemplateService, GridPanel, PopupService, ValueService, MasterSlaveService,
                LoggerFactory, ColumnUtils, AutoWidthCalculator, PopupService, GridCore, StandardMenuFactory,
                DragAndDropService, SortController, ColumnApi, FocusedCellController, MouseEventService,
                CellNavigationService, FilterStage, SortStage, FlattenStage, FocusService, FilterService, RowNodeFactory,
                CellEditorFactory, CellRendererService, ValueFormatterService, StylingService, ScrollVisibleService,
                ColumnHoverService, ColumnAnimationService, SortService, AutoGroupColService, ImmutableService],
            components: [
                {componentName: 'AgCheckbox', theClass: AgCheckbox}
            ],
            debug: !!gridOptions.debug
        };

        let isLoggingFunc = ()=> contextParams.debug;
        this.context = new Context(contextParams, new Logger('Context', isLoggingFunc));

        let eventService = this.context.getBean('eventService');
        let readyEvent = {
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        eventService.dispatchEvent(Events.EVENT_GRID_READY, readyEvent);

        if (gridOptions.debug) {
            console.log('ag-Grid -> initialised successfully, enterprise = ' + enterprise);
        }
    }

    private getRowModelClass(gridOptions: GridOptions): any {
        let rowModelType = gridOptions.rowModelType;
        if (_.exists(rowModelType)) {
            let rowModelClass = Grid.RowModelClasses[rowModelType];
            if (_.exists(rowModelClass)) {
                return rowModelClass;
            } else {
                console.error('ag-Grid: count not find matching row model for rowModelType ' + rowModelType);
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