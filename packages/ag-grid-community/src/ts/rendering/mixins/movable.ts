import { DragListenerParams, DragService } from "../../dragAndDrop/dragService";
import { IPositionable } from "./positionable";
import { PopupService } from "../../widgets/popupService";
import { _ } from "../../utils";

export interface IMovable extends IPositionable {
    setMovable?(movable: boolean): void;
}

export function Movable<T extends { new(...args:any[]): IMovable }>(target: T) {
    abstract class MixinClass extends target {

        abstract config: any;
        abstract minWidth?: number;
        abstract minHeight?: number;
        abstract moveElement: HTMLElement;
        abstract moveElementDragListener: DragListenerParams;
        abstract popupService: PopupService;
        abstract dragService: DragService;
        abstract updateDragStartPosition(x: number, y: number): void;
        abstract calculateMouseMovement(params: {
            e: MouseEvent,
            topBuffer?: number,
            anywhereWithin?: boolean,
            isLeft?: boolean,
            isTop?: boolean
        }): { movementX: number, movementY: number};
        abstract position: {x: number; y: number};
        abstract getBodyHeight(): number;
        abstract offsetElement(x: number, y: number): void;

        movable = false;
        isMoving = false;

        postConstruct() {
            super.postConstruct();
            const { movable } = this.config;

            if (movable) {
                this.setMovable(movable);
            }

        }

        onMoveStart(e: MouseEvent) {
            this.isMoving = true;
            this.updateDragStartPosition(e.clientX, e.clientY);
        }

        onMove(e: MouseEvent) {
            if (!this.isMoving) { return; }
            const { x, y } = this.position;
            const { movementX, movementY } = this.calculateMouseMovement({
                e,
                isTop: true,
                anywhereWithin: true,
                topBuffer: this.getHeight() - this.getBodyHeight()
            });

            this.offsetElement(x + movementX, y + movementY);

            this.updateDragStartPosition(e.clientX, e.clientY);
        }

        onMoveEnd() {
            this.isMoving = false;
        }

        destroy(): void {
            super.destroy();
            this.setMovable(false);
        }

        public setMovable(movable: boolean) {
            if (movable !== this.movable) {
                this.movable = movable;

                const params: DragListenerParams = this.moveElementDragListener || {
                    eElement: this.moveElement,
                    onDragStart: this.onMoveStart.bind(this),
                    onDragging: this.onMove.bind(this),
                    onDragStop: this.onMoveEnd.bind(this)
                };

                if (movable) {
                    this.dragService.addDragSource(params);
                    this.moveElementDragListener = params;
                } else {
                    this.dragService.removeDragSource(params);
                    this.moveElementDragListener = undefined;
                }
            }
        }
    }

    return MixinClass;
}