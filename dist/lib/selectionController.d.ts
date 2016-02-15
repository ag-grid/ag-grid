// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Grid } from "./grid";
import GridOptionsWrapper from "./gridOptionsWrapper";
import RowRenderer from "./rendering/rowRenderer";
import EventService from "./eventService";
import GridPanel from "./gridPanel/gridPanel";
export default class SelectionController {
    private eParentsOfRows;
    private angularGrid;
    private gridOptionsWrapper;
    private $scope;
    private rowRenderer;
    private selectedRows;
    private selectedNodesById;
    private rowModel;
    private eventService;
    init(angularGrid: Grid, gridPanel: GridPanel, gridOptionsWrapper: GridOptionsWrapper, $scope: any, rowRenderer: RowRenderer, eventService: EventService): void;
    private initSelectedNodesById();
    getSelectedNodesById(): any;
    getSelectedRows(): any;
    getSelectedNodes(): any;
    getBestCostNodeSelection(): any;
    setRowModel(rowModel: any): void;
    deselectAll(): void;
    selectAll(): void;
    selectNode(node: any, tryMulti: any, suppressEvents?: any): void;
    private recursivelySelectAllChildren(node, suppressEvents?);
    private recursivelyDeselectAllChildren(node, suppressEvents);
    private doWorkOfSelectNode(node, suppressEvents);
    private addCssClassForNode_andInformVirtualRowListener(node);
    private doWorkOfDeselectAllNodes(nodeToKeepSelected, suppressEvents);
    private deselectRealNode(node, suppressEvents);
    private removeCssClassForNode(node);
    deselectIndex(rowIndex: any, suppressEvents?: boolean): void;
    deselectNode(node: any, suppressEvents?: boolean): void;
    selectIndex(index: any, tryMulti: boolean, suppressEvents?: boolean): void;
    private syncSelectedRowsAndCallListener(suppressEvents?);
    private recursivelyCheckIfSelected(node);
    isNodeSelected(node: any): boolean;
    private updateGroupParentsIfNeeded();
}
