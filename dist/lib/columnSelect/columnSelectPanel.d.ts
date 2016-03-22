// ag-grid-enterprise v4.0.7
import { Component } from "ag-grid/main";
export declare class ColumnSelectPanel extends Component {
    private columnController;
    private globalEventService;
    private context;
    private static TEMPLATE;
    private renderedItems;
    private columnTree;
    private allowDragging;
    constructor(allowDragging: boolean);
    init(): void;
    onColumnsChanged(): void;
    destroy(): void;
    private destroyAllRenderedElements();
    private recursivelyRenderGroupComponent(columnGroup, dept);
    private recursivelyRenderColumnComponent(column, dept);
    private recursivelyRenderComponents(tree, dept);
    private recursivelySetVisibility(columnTree, visible);
    onGroupExpanded(): void;
}
