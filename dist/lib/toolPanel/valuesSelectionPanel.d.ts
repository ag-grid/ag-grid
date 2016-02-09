// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import PopupService from "../widgets/agPopupService";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import EventService from "../eventService";
export default class ValuesSelectionPanel {
    private gridOptionsWrapper;
    private columnController;
    private cColumnList;
    private layout;
    private popupService;
    private dragAndDropService;
    constructor(columnController: ColumnController, gridOptionsWrapper: GridOptionsWrapper, popupService: PopupService, eventService: EventService, dragAndDropService: DragAndDropService);
    getLayout(): any;
    private columnsChanged();
    addDragSource(dragSource: any): void;
    private cellRenderer(params);
    private setupComponents();
    private beforeDropListener(newItem);
}
