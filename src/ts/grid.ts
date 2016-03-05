
import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {InMemoryRowController} from "./rowControllers/inMemory/inMemoryRowController";
import {PaginationController} from "./rowControllers/paginationController";
import {VirtualPageRowController} from "./rowControllers/virtualPageRowController";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {SelectionController} from "./selectionController";
import {ColumnController} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {FilterManager} from "./filter/filterManager";
import {ValueService} from "./valueService";
import {MasterSlaveService} from "./masterSlaveService";
import {EventService} from "./eventService";
import {OldToolPanelDragAndDropService} from "./dragAndDrop/oldToolPanelDragAndDropService";
import {GridPanel} from "./gridPanel/gridPanel";
import {Logger} from "./logger";
import {GridApi} from "./gridApi";
import {Constants} from "./constants";
import {HeaderTemplateLoader} from "./headerRendering/headerTemplateLoader";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {SelectionRendererFactory} from "./selectionRendererFactory";
import {ExpressionService} from "./expressionService";
import {TemplateService} from "./templateService";
import {PopupService} from "./widgets/popupService";
import {LoggerFactory} from "./logger";
import {ColumnUtils} from "./columnController/columnUtils";
import {AutoWidthCalculator} from "./rendering/autoWidthCalculator";
import {Events} from "./events";
import {BorderLayout} from "./layout/borderLayout";
import {ColumnChangeEvent} from "./columnChangeEvent";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {ColDef} from "./entities/colDef";
import {HorizontalDragService} from "./headerRendering/horizontalDragService";
import {Context} from './context/context';
import {CsvCreator} from "./csvCreator";
import {GridCore} from "./gridCore";
import {StandardMenuFactory} from "./headerRendering/standardMenu";
import {DragAndDropService} from "./dragAndDrop/dragAndDropService";
import {DragService} from "./dragAndDrop/dragService";
import {SortController} from "./sortController";
import {ColumnApi} from "./columnController/columnController";
import {FocusedCellController} from "./focusedCellController";
import {MouseEventService} from "./gridPanel/mouseEventService";
import {CellNavigationService} from "./cellNavigationService";
import {Utils as _} from './utils';
import {FilterStage} from "./rowControllers/inMemory/fillterStage";
import {SortStage} from "./rowControllers/inMemory/sortStage";
import {FlattenStage} from "./rowControllers/inMemory/flattenStage";

export class Grid {

    private context: Context;

    private static enterpriseBeans: any[];

    public static setEnterpriseBeans(enterpriseBeans: any[]): void {
        this.enterpriseBeans = enterpriseBeans;
    }

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, globalEventListener: Function = null, $scope: any = null, $compile: any = null, quickFilterOnScope: any = null) {

        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
        }

        var virtualPaging = gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIRTUAL;
        var rowModelClass = virtualPaging ? VirtualPageRowController : InMemoryRowController;

        var enterprise = _.exists(Grid.enterpriseBeans);

        this.context = new Context({
            overrideBeans: Grid.enterpriseBeans,
            seed: {
                enterprise: enterprise,
                gridOptions: gridOptions,
                eGridDiv: eGridDiv,
                $scope: $scope,
                $compile: $compile,
                quickFilterOnScope: quickFilterOnScope,
                globalEventListener: globalEventListener
            },
            beans: [rowModelClass, HorizontalDragService, HeaderTemplateLoader, FloatingRowModel, DragService,
                DisplayedGroupCreator, EventService, GridOptionsWrapper, SelectionController,
                FilterManager, SelectionRendererFactory, ColumnController, RowRenderer,
                HeaderRenderer, ExpressionService, BalancedColumnTreeBuilder, CsvCreator,
                TemplateService, GridPanel, PopupService, ValueService, MasterSlaveService,
                LoggerFactory, OldToolPanelDragAndDropService, ColumnUtils, AutoWidthCalculator, GridApi,
                PaginationController, PopupService, GridCore, StandardMenuFactory,
                DragAndDropService, SortController, ColumnApi, FocusedCellController, MouseEventService,
                CellNavigationService, FilterStage, SortStage, FlattenStage],
            debug: !!gridOptions.debug
        });
    }

    public destroy(): void {
        this.context.destroy();
    }

}
