
import {GridOptions} from "./entities/gridOptions";
import GridOptionsWrapper from "./gridOptionsWrapper";
import InMemoryRowController from "./rowControllers/inMemoryRowController";
import PaginationController from "./rowControllers/paginationController";
import VirtualPageRowController from "./rowControllers/virtualPageRowController";
import FloatingRowModel from "./rowControllers/floatingRowModel";
import SelectionController from "./selectionController";
import {ColumnController} from "./columnController/columnController";
import RowRenderer from "./rendering/rowRenderer";
import HeaderRenderer from "./headerRendering/headerRenderer";
import FilterManager from "./filter/filterManager";
import ValueService from "./valueService";
import MasterSlaveService from "./masterSlaveService";
import EventService from "./eventService";
import OldToolPanelDragAndDropService from "./dragAndDrop/oldToolPanelDragAndDropService";
import GridPanel from "./gridPanel/gridPanel";
import {Logger} from "./logger";
import {GridApi} from "./gridApi";
import Constants from "./constants";
import HeaderTemplateLoader from "./headerRendering/headerTemplateLoader";
import BalancedColumnTreeBuilder from "./columnController/balancedColumnTreeBuilder";
import DisplayedGroupCreator from "./columnController/displayedGroupCreator";
import SelectionRendererFactory from "./selectionRendererFactory";
import ExpressionService from "./expressionService";
import TemplateService from "./templateService";
import PopupService from "./widgets/agPopupService";
import GroupCreator from "./groupCreator";
import {LoggerFactory} from "./logger";
import ColumnUtils from "./columnController/columnUtils";
import AutoWidthCalculator from "./rendering/autoWidthCalculator";
import {Events} from "./events";
import ToolPanel from "./toolPanel/toolPanel";
import BorderLayout from "./layout/borderLayout";
import ColumnChangeEvent from "./columnChangeEvent";
import Column from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {ColDef} from "./entities/colDef";
import {HorizontalDragService} from "./headerRendering/horizontalDragService";
import {Context} from './context/context';
import {CsvCreator} from "./csvCreator";
import {GridCore} from "./gridCore";
import {StandardMenuFactory} from "./headerRendering/standardMenu";
import {EnterpriseMenuFactory} from "./enterprise/enterpriseMenu";
import {DragAndDropService} from "./dragAndDrop/dragAndDropService";
import {DragService} from "./dragAndDrop/dragService";
import {RowGroupPanel} from "./enterprise/rowGroupPanel";
import {ColumnSelectPanel} from "./enterprise/columnSelect/columnSelectPanel";
import {SortController} from "./sortController";
import {ColumnApi} from "./columnController/columnController";
import {RangeController} from "./enterprise/rangeController";
import {FocusedCellController} from "./focusedCellController";

export class Grid {

    private context: Context;

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, globalEventListener: Function = null, $scope: any = null, $compile: any = null, quickFilterOnScope: any = null) {

        if (!eGridDiv) {
            console.warn('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.warn('ag-Grid: no gridOptions provided to the grid');
        }

        var virtualPaging = gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIRTUAL;
        var rowModelClass = virtualPaging ? VirtualPageRowController : InMemoryRowController;

        this.context = new Context({
            //overrideBeans: null,
            overrideBeans: [EnterpriseMenuFactory, RowGroupPanel, ColumnSelectPanel, RangeController],
            seed: {
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
                TemplateService, GridPanel, PopupService, ValueService, GroupCreator, MasterSlaveService,
                LoggerFactory, OldToolPanelDragAndDropService, ColumnUtils, AutoWidthCalculator, GridApi,
                PaginationController, PopupService, GridCore, ToolPanel, StandardMenuFactory,
                DragAndDropService, SortController, ColumnApi, FocusedCellController],
            debug: !!gridOptions.debug
        });
    }

    public destroy(): void {
        this.context.destroy();
    }

}
