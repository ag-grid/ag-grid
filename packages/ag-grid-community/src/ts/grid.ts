import { GridOptions } from "./entities/gridOptions";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { SelectionController } from "./selectionController";
import { ColumnApi } from "./columnController/columnApi";
import { ColumnController } from "./columnController/columnController";
import { RowRenderer } from "./rendering/rowRenderer";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { FilterManager } from "./filter/filterManager";
import { ValueService } from "./valueService/valueService";
import { EventService } from "./eventService";
import { GridPanel } from "./gridPanel/gridPanel";
import { GridApi } from "./gridApi";
import { ColumnFactory } from "./columnController/columnFactory";
import { DisplayedGroupCreator } from "./columnController/displayedGroupCreator";
import { ExpressionService } from "./valueService/expressionService";
import { TemplateService } from "./templateService";
import { PopupService } from "./widgets/popupService";
import { Logger, LoggerFactory } from "./logger";
import { ColumnUtils } from "./columnController/columnUtils";
import { AutoWidthCalculator } from "./rendering/autoWidthCalculator";
import { HorizontalResizeService } from "./headerRendering/horizontalResizeService";
import { Context } from "./context/context";
import { CsvCreator } from "./exporter/csvCreator";
import { GridCore } from "./gridCore";
import { StandardMenuFactory } from "./headerRendering/standardMenu";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { DragService } from "./dragAndDrop/dragService";
import { SortController } from "./sortController";
import { FocusedCellController } from "./focusedCellController";
import { MouseEventService } from "./gridPanel/mouseEventService";
import { CellNavigationService } from "./cellNavigationService";
import { FilterStage } from "./rowModels/clientSide/filterStage";
import { SortStage } from "./rowModels/clientSide/sortStage";
import { FlattenStage } from "./rowModels/clientSide/flattenStage";
import { Events, GridReadyEvent } from "./events";
import { InfiniteRowModel } from "./rowModels/infinite/infiniteRowModel";
import { ClientSideRowModel } from "./rowModels/clientSide/clientSideRowModel";
import { CellRendererFactory } from "./rendering/cellRendererFactory";
import { ValueFormatterService } from "./rendering/valueFormatterService";
import { AgCheckbox } from "./widgets/agCheckbox";
import { AgRadioButton } from "./widgets/agRadioButton";
import { VanillaFrameworkOverrides } from "./vanillaFrameworkOverrides";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { ScrollVisibleService } from "./gridPanel/scrollVisibleService";
import { Downloader } from "./exporter/downloader";
import { XmlFactory } from "./exporter/xmlFactory";
import { GridSerializer } from "./exporter/gridSerializer";
import { StylingService } from "./styling/stylingService";
import { ColumnHoverService } from "./rendering/columnHoverService";
import { ColumnAnimationService } from "./rendering/columnAnimationService";
import { SortService } from "./rowNodes/sortService";
import { FilterService } from "./rowNodes/filterService";
import { AutoGroupColService } from "./columnController/autoGroupColService";
import { PaginationProxy } from "./rowModels/paginationProxy";
import { PaginationAutoPageSizeService } from "./rowModels/paginationAutoPageSizeService";
import { ImmutableService } from "./rowModels/clientSide/immutableService";
import { IRowModel } from "./interfaces/iRowModel";
import { Constants } from "./constants";
import { ValueCache } from "./valueService/valueCache";
import { ChangeDetectionService } from "./valueService/changeDetectionService";
import { AlignedGridsService } from "./alignedGridsService";
import { PinnedRowModel } from "./rowModels/pinnedRowModel";
import { UserComponentFactory } from "./components/framework/userComponentFactory";
import { UserComponentRegistry } from "./components/framework/userComponentRegistry";
import { AgComponentUtils } from "./components/framework/agComponentUtils";
import { ComponentMetadataProvider } from "./components/framework/componentMetadataProvider";
import { Beans } from "./rendering/beans";
import { Environment } from "./environment";
import { AnimationFrameService } from "./misc/animationFrameService";
import { NavigationService } from "./gridPanel/navigationService";
import { MaxDivHeightScaler } from "./rendering/maxDivHeightScaler";
import { SelectableService } from "./rowNodes/selectableService";
import { AutoHeightCalculator } from "./rendering/autoHeightCalculator";
import { PaginationComp } from "./rowModels/pagination/paginationComp";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { ZipContainer } from "./exporter/files/zip/zipContainer";
import { TooltipManager } from "./widgets/tooltipManager";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { Module } from "./interfaces/iModule";
import { AgGroupComponent } from "./widgets/agGroupComponent";
import { AgDialog } from "./widgets/agDialog";
import { AgPanel } from "./widgets/agPanel";
import { AgInputTextField } from "./widgets/agInputTextField";
import { AgInputTextArea } from "./widgets/agInputTextArea";
import { AgSlider } from "./widgets/agSlider";
import { _ } from "./utils";
import { AgColorPicker } from "./widgets/agColorPicker";
import { AgInputNumberField } from "./widgets/agInputNumberField";
import { AgInputRange } from "./widgets/agInputRange";
import { AgSelect } from "./widgets/agSelect";
import { AgAngleSelect } from "./widgets/agAngleSelect";
import { AgToggleButton } from "./widgets/agToggleButton";
import { DetailRowCompCache } from "./rendering/detailRowCompCache";
import {RowPositionUtils} from "./entities/rowPosition";
import {CellPositionUtils} from "./entities/cellPosition";

export interface GridParams {
    // used by Web Components
    globalEventListener?: Function;

    // these are used by ng1 only
    $scope?: any;
    $compile?: any;
    quickFilterOnScope?: any;

    // this allows the base frameworks (React, NG2, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;

    //bean instances to add to the context
    seedBeanInstances?: {[key:string]:any};
}

export class Grid {

    private context: Context;

    private static enterpriseBeans: any[] = [];
    private static frameworkBeans: any[];
    private static enterpriseComponents: any[] = [];
    private static enterpriseDefaultComponents: any[] = [];

    private static modulesToInclude: Module[] = [];

    protected logger: Logger;

    private gridOptions: GridOptions;

    // the default is ClientSideRowModel, which is also used for pagination.
    // the enterprise adds viewport to this list.
    private static RowModelClasses: any = {
        infinite: InfiniteRowModel,
        clientSide: ClientSideRowModel
    };

    public static setEnterpriseBeans(enterpriseBeans: any[], rowModelClasses: any): void {
        Grid.enterpriseBeans = enterpriseBeans;

        // the enterprise can inject additional row models. this is how it injects the viewportRowModel
        _.iterateObject(rowModelClasses, (key: string, value: any) => Grid.RowModelClasses[key] = value);
    }

    public static setEnterpriseComponents(components: any[]): void {
        Grid.enterpriseComponents = components;
    }

    public static setFrameworkBeans(frameworkBeans: any[]): void {
        Grid.frameworkBeans = frameworkBeans;
    }

    public static setEnterpriseDefaultComponents(enterpriseDefaultComponents: any[]): void {
        Grid.enterpriseDefaultComponents = enterpriseDefaultComponents;
    }

    public static addModule(modulesToInclude: Module[]): void {
        // de-duping would need to be done here (while ensuring order etc)
        Grid.modulesToInclude.push(...modulesToInclude);
    }

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams) {

        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
        }

        this.gridOptions = gridOptions;

        const rowModelClass = this.getRowModelClass(gridOptions);

        const enterprise = !_.missingOrEmpty(Grid.enterpriseBeans);

        const moduleBeans = this.extractModuleEntity(Grid.modulesToInclude, (module) => module.beans ? module.beans : []);
        const moduleEnterpriseBeans = this.extractModuleEntity(Grid.modulesToInclude, (module) => module.enterpriseBeans ? module.enterpriseBeans : []);
        const moduleEnterpriseComponents = this.extractModuleEntity(Grid.modulesToInclude, (module) => module.enterpriseComponents ? module.enterpriseComponents : []);
        const modulesEnterpriseDefaultComponents = this.extractModuleEntity(Grid.modulesToInclude, (module) => module.enterpriseDefaultComponents ? module.enterpriseDefaultComponents : []);

        let frameworkOverrides = params ? params.frameworkOverrides : null;
        if (_.missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
        }

        let overrideBeans:any[] = [];

        if (Grid.enterpriseBeans) {
            overrideBeans = overrideBeans.concat(Grid.enterpriseBeans)
                .concat(moduleEnterpriseBeans);
        }

        if (Grid.frameworkBeans) {
            overrideBeans = overrideBeans.concat(Grid.frameworkBeans);
        }

        const seed = {
            enterprise: enterprise,
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            $scope: params ? params.$scope : null,
            $compile: params ? params.$compile : null,
            quickFilterOnScope: params ? params.quickFilterOnScope : null,
            globalEventListener: params ? params.globalEventListener : null,
            frameworkOverrides: frameworkOverrides
        };
        if (params && params.seedBeanInstances) {
            _.assign(seed, params.seedBeanInstances);
        }

        let components = [
            { componentName: 'AgCheckbox', theClass: AgCheckbox },
            { componentName: 'AgRadioButton', theClass: AgRadioButton },
            { componentName: 'AgToggleButton', theClass: AgToggleButton },
            { componentName: 'AgInputTextField', theClass: AgInputTextField},
            { componentName: 'AgInputTextArea', theClass: AgInputTextArea},
            { componentName: 'AgInputNumberField', theClass: AgInputNumberField},
            { componentName: 'AgInputRange', theClass: AgInputRange},
            { componentName: 'AgSelect', theClass: AgSelect},
            { componentName: 'AgSlider', theClass: AgSlider},
            { componentName: 'AgAngleSelect', theClass: AgAngleSelect },
            { componentName: 'AgColorPicker', theClass: AgColorPicker },
            { componentName: 'AgGridComp', theClass: GridPanel },
            { componentName: 'AgHeaderRoot', theClass: HeaderRootComp },
            { componentName: 'AgPagination', theClass: PaginationComp },
            { componentName: 'AgOverlayWrapper', theClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', theClass: AgGroupComponent },
            { componentName: 'AgPanel', theClass: AgPanel },
            { componentName: 'AgDialog', theClass: AgDialog }
        ];

        if (Grid.enterpriseComponents) {
            components = components.concat(Grid.enterpriseComponents)
                .concat(moduleEnterpriseComponents);
        }

        const contextParams = {
            overrideBeans: overrideBeans,
            seed: seed,
            //Careful with the order of the beans here, there are dependencies between them that need to be kept
            beans: [
                // this should only contain SERVICES, it should NEVER contain COMPONENTS
                rowModelClass, Beans, RowPositionUtils, CellPositionUtils,
                PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
                ComponentMetadataProvider, ResizeObserverService, UserComponentRegistry, UserComponentFactory,
                MaxDivHeightScaler, AutoHeightCalculator, CellRendererFactory, HorizontalResizeService,
                PinnedRowModel, DragService, DisplayedGroupCreator, EventService, GridOptionsWrapper, PopupService,
                SelectionController, FilterManager, ColumnController, PaginationProxy, RowRenderer, ExpressionService,
                ColumnFactory, CsvCreator, Downloader, XmlFactory, GridSerializer, TemplateService, AlignedGridsService,
                NavigationService, PopupService, ValueCache, ValueService, LoggerFactory, ColumnUtils, AutoWidthCalculator,
                StandardMenuFactory, DragAndDropService, ColumnApi, FocusedCellController, MouseEventService, Environment,
                CellNavigationService, FilterStage, SortStage, FlattenStage, FilterService,
                ValueFormatterService, StylingService, ScrollVisibleService, SortController,
                ColumnHoverService, ColumnAnimationService, SortService, SelectableService, AutoGroupColService,
                ImmutableService, ChangeDetectionService, AnimationFrameService, TooltipManager, ZipContainer,
                DetailRowCompCache,
                ...moduleBeans
            ],
            components: components,
            enterpriseDefaultComponents: Grid.enterpriseDefaultComponents.concat(modulesEnterpriseDefaultComponents),
            registeredModules: Grid.modulesToInclude.map(module => module.moduleName),
            debug: !!gridOptions.debug
        };

        this.logger = new Logger('ag-Grid', () => gridOptions.debug);
        const contextLogger = new Logger('Context', () => contextParams.debug);
        this.context = new Context(contextParams, contextLogger);

        const gridCore = new GridCore();
        this.context.wireBean(gridCore);

        this.setColumnsAndData();
        this.dispatchGridReadyEvent(gridOptions);
        this.logger.log(`initialised successfully, enterprise = ${enterprise}`);
    }

    private extractModuleEntity(moduleEntities: any[], extractor: (module: any) => any) {
        return [].concat(...moduleEntities.map(extractor));
    }

    private setColumnsAndData(): void {

        const gridOptionsWrapper: GridOptionsWrapper = this.context.getBean('gridOptionsWrapper');
        const columnController: ColumnController = this.context.getBean('columnController');
        const rowModel: IRowModel = this.context.getBean('rowModel');

        const columnDefs = gridOptionsWrapper.getColumnDefs();
        const rowData = gridOptionsWrapper.getRowData();

        const nothingToSet = _.missing(columnDefs) && _.missing(rowData);
        if (nothingToSet) { return; }

        if (_.exists(columnDefs)) {
            columnController.setColumnDefs(columnDefs, "gridInitializing");
        }

        if (_.exists(rowData) && rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            const clientSideRowModel = rowModel as ClientSideRowModel;
            clientSideRowModel.setRowData(rowData);
        }
    }

    private dispatchGridReadyEvent(gridOptions: GridOptions): void {
        const eventService: EventService = this.context.getBean('eventService');
        const readyEvent: GridReadyEvent = {
            type: Events.EVENT_GRID_READY,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        eventService.dispatchEvent(readyEvent);
    }

    private getRowModelClass(gridOptions: GridOptions): any {
        let rowModelType = gridOptions.rowModelType;

        //TODO: temporary measure before 'enterprise' is completely removed (similar handling in gridOptionsWrapper is also required)
        rowModelType = rowModelType === 'enterprise' ? Constants.ROW_MODEL_TYPE_SERVER_SIDE : rowModelType;

        if (_.exists(rowModelType)) {
            const rowModelClass = Grid.RowModelClasses[rowModelType];
            if (_.exists(rowModelClass)) {
                return rowModelClass;
            } else {
                if (rowModelType === 'normal') {
                    console.warn(`ag-Grid: normal rowModel deprecated. Should now be called client side row model instead.`);
                    return ClientSideRowModel;
                }
                console.error('ag-Grid: could not find matching row model for rowModelType ' + rowModelType);
                if (rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT) {
                    console.error('ag-Grid: rowModelType viewport is only available in ag-Grid Enterprise');
                }
                if (rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
                    console.error('ag-Grid: rowModelType server side is only available in ag-Grid Enterprise');
                }
            }
        }
        return ClientSideRowModel;
    }

    public destroy(): void {
        this.gridOptions.api.destroy();
    }

}
