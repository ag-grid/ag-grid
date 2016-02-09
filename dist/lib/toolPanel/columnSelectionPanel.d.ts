// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import EventService from "../eventService";
export default class ColumnSelectionPanel {
    private gridOptionsWrapper;
    private columnController;
    private cColumnList;
    layout: any;
    private eRootPanel;
    private dragAndDropService;
    constructor(columnController: ColumnController, gridOptionsWrapper: GridOptionsWrapper, eventService: EventService, dragAndDropService: DragAndDropService);
    private columnsChanged();
    getDragSource(): any;
    private columnCellRenderer(params);
    private setupComponents();
    private onItemMoved(fromIndex, toIndex);
    getGui(): any;
}
