/// <reference path="../utils.ts" />

module ag.grid {

    var _ = Utils;

    export class DragAndDropService {

        private dragItem: any;
        private mouseUpEventListener: EventListener;
        private logger: Logger;

        public init(loggerFactory: LoggerFactory) {
            this.logger = loggerFactory.create('DragAndDropService');

            // need to clean this up, add to 'finished' logic in grid
            var that = this;
            this.mouseUpEventListener = function listener() {
                that.stopDragging();
            };
            document.addEventListener('mouseup', this.mouseUpEventListener);
            this.logger.log('initialised');
        }

        public destroy(): void {
            document.removeEventListener('mouseup', this.mouseUpEventListener);
            this.logger.log('destroyed');
        }

        private stopDragging() {
            if (this.dragItem) {
                this.setDragCssClasses(this.dragItem.eDragSource, false);
                this.dragItem = null;
            }
        }

        private setDragCssClasses(eListItem: any, dragging: any) {
            _.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
            _.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
        }

        public addDragSource(eDragSource: any, dragSourceCallback: any) {

            this.setDragCssClasses(eDragSource, false);

            eDragSource.addEventListener('mousedown',
                this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
        }

        private onMouseDownDragSource(eDragSource: any, dragSourceCallback: any) {
            if (this.dragItem) {
                this.stopDragging();
            }
            var data: any;
            if (dragSourceCallback.getData) {
                data = dragSourceCallback.getData();
            }
            var containerId: any;
            if (dragSourceCallback.getContainerId) {
                containerId = dragSourceCallback.getContainerId();
            }

            this.dragItem = {
                eDragSource: eDragSource,
                data: data,
                containerId: containerId
            };
            this.setDragCssClasses(this.dragItem.eDragSource, true);
        }

        public addDropTarget(eDropTarget: any, dropTargetCallback: any) {
            var mouseIn = false;
            var acceptDrag = false;
            var that = this;

            eDropTarget.addEventListener('mouseover', function() {
                if (!mouseIn) {
                    mouseIn = true;
                    if (that.dragItem) {
                        acceptDrag = dropTargetCallback.acceptDrag(that.dragItem);
                    } else {
                        acceptDrag = false;
                    }
                }
            });

            eDropTarget.addEventListener('mouseout', function() {
                if (acceptDrag) {
                    dropTargetCallback.noDrop();
                }
                mouseIn = false;
                acceptDrag = false;
            });

            eDropTarget.addEventListener('mouseup', function() {
                // dragItem should never be null, checking just in case
                if (acceptDrag && that.dragItem) {
                    dropTargetCallback.drop(that.dragItem);
                }
            });

        }

    }

}

