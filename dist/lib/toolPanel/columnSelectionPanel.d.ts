// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import { OldToolPanelDragAndDropService } from "../dragAndDrop/oldToolPanelDragAndDropService";
import { EventService } from "../eventService";
export default class ColumnSelectionPanel {
    private gridOptionsWrapper;
    private columnController;
    private cColumnList;
    layout: any;
    private eRootPanel;
    private oldToolPanelDragAndDropService;
    constructor(columnController: ColumnController, gridOptionsWrapper: GridOptionsWrapper, eventService: EventService, oldToolPanelDragAndDropService: OldToolPanelDragAndDropService);
    private columnsChanged();
    getDragSource(): any;
    private columnCellRenderer(params);
    private setupComponents();
    private onItemMoved(fromIndex, toIndex);
    getGui(): any;
}
