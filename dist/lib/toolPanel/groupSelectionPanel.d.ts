// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnController } from "../columnController/columnController";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import GridOptionsWrapper from "../gridOptionsWrapper";
import EventService from "../eventService";
export default class GroupSelectionPanel {
    private gridOptionsWrapper;
    private columnController;
    private inMemoryRowController;
    private cColumnList;
    layout: any;
    private dragAndDropService;
    constructor(columnController: ColumnController, inMemoryRowController: any, gridOptionsWrapper: GridOptionsWrapper, eventService: EventService, dragAndDropService: DragAndDropService);
    private columnsChanged();
    addDragSource(dragSource: any): void;
    private columnCellRenderer(params);
    private setupComponents();
    private onBeforeDrop(newItem);
    private onItemMoved(fromIndex, toIndex);
}
