// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import PopupService from "../widgets/agPopupService";
import EventService from "../eventService";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import GridOptionsWrapper from "../gridOptionsWrapper";
export default class ToolPanel {
    layout: any;
    constructor();
    init(columnController: any, inMemoryRowController: any, gridOptionsWrapper: GridOptionsWrapper, popupService: PopupService, eventService: EventService, dragAndDropService: DragAndDropService): void;
}
