
import {Logger} from "../logger";
import {Qualifier} from "../context/context";
import {LoggerFactory} from "../logger";
import {Bean} from "../context/context";
import Column from "../entities/column";

@Bean('dragAndDropService2')
export class DragAndDropService2 {

    public static DIRECTION_LEFT = 'left';
    public static DIRECTION_RIGHT = 'right';

    private logger: Logger;

    private dragging = false;
    private dragItem: Column;
    private dragSource: any;

    private eventXLastTime: number;

    private onStopDragging = this.stopDragging.bind(this);

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('DragAndDropService');
    }

    public addDragSource(params: {eElement: HTMLElement, dragItem: Column, dragSource: any}): void {
        params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params.dragItem, params.dragSource));
    }

    public onMouseDown(dragItem: Column, dragSource: any, mouseEvent: MouseEvent): void {
        this.startDrag(dragItem, dragSource, mouseEvent);
    }

    public addDropTarget(params: {
                        eElement: HTMLElement,
                        onDragCallback: Function}) {
        params.eElement.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.dragging) {
                //localise x and y to the target component
                var rect = params.eElement.getBoundingClientRect();
                var x = event.x - rect.left;
                var y = event.y - rect.top;

                var direction: string;
                if (this.eventXLastTime > event.x) {
                    direction = DragAndDropService2.DIRECTION_LEFT;
                } else if (this.eventXLastTime < event.x) {
                    direction = DragAndDropService2.DIRECTION_RIGHT;
                } else {
                    direction = null;
                }

                params.onDragCallback({
                    event: event,
                    x: x,
                    y: y,
                    direction: direction,
                    dragItem: this.dragItem,
                    dragSource: this.dragSource
                });

                this.eventXLastTime = event.x;
            }
        });
    }

    public startDrag(dragItem: Column, dragSource: any, mouseEvent: MouseEvent): void {
        this.logger.log('startDrag');
        this.eventXLastTime = mouseEvent.x;
        dragItem.setMoving(true);
        this.dragging = true;
        this.dragItem = dragItem;
        this.dragSource = dragSource;
        document.addEventListener('mouseup', this.onStopDragging);
    }

    public stopDragging(): void {
        this.logger.log('stopDragging');
        this.dragItem.setMoving(false);
        this.dragging = false;
        this.dragItem = null;
        document.removeEventListener('mouseup', this.onStopDragging);
    }

}
