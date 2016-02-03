// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from "../logger";
export default class DragAndDropService {
    private dragItem;
    private mouseUpEventListener;
    private logger;
    init(loggerFactory: LoggerFactory): void;
    destroy(): void;
    private stopDragging();
    private setDragCssClasses(eListItem, dragging);
    addDragSource(eDragSource: any, dragSourceCallback: any): void;
    private onMouseDownDragSource(eDragSource, dragSourceCallback);
    addDropTarget(eDropTarget: any, dropTargetCallback: any): void;
}
