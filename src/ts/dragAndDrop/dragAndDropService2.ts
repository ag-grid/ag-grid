
import {Logger} from "../logger";
import {Qualifier} from "../context/context";
import {LoggerFactory} from "../logger";
export class DragAndDropService2 {

    private logger: Logger;

    private dragging = false;
    private dragItem: any;

    private onStopDragging = this.stopDragging.bind(this);

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('DragAndDropService');
    }

    public startDrag(dragItem: any): void {
        this.logger.log('startDrag');
        this.dragging = true;
        this.dragItem = dragItem;
        document.addEventListener('mouseup', this.onStopDragging);
    }

    public stopDragging(): void {
        this.logger.log('stopDragging');
        this.dragging = false;
        this.dragItem = null;
        document.removeEventListener('mouseup', this.onStopDragging);
    }

}