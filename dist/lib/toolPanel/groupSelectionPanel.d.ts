// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnController } from "../columnController/columnController";
import { OldToolPanelDragAndDropService } from "../dragAndDrop/oldToolPanelDragAndDropService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { EventService } from "../eventService";
export default class GroupSelectionPanel {
    private gridOptionsWrapper;
    private columnController;
    private inMemoryRowController;
    private cColumnList;
    layout: any;
    private oldToolPanelDragAndDropService;
    constructor(columnController: ColumnController, inMemoryRowController: any, gridOptionsWrapper: GridOptionsWrapper, eventService: EventService, dragAndDropService: OldToolPanelDragAndDropService);
    private columnsChanged();
    addDragSource(dragSource: any): void;
    private columnCellRenderer(params);
    private setupComponents();
    private onBeforeDrop(newItem);
    private onItemMoved(fromIndex, toIndex);
}
