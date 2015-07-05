/// <reference path="../utils.ts" />

module awk.grid {

    var utils = Utils;

    export class DragAndDropService {

        static theInstance: DragAndDropService;

        static getInstance(): DragAndDropService {
            if (!this.theInstance) {
                this.theInstance = new DragAndDropService();
            }
            return this.theInstance;
        }

        dragItem: any;

        constructor() {
            // need to clean this up, add to 'finished' logic in grid
            document.addEventListener('mouseup', this.stopDragging.bind(this));
        }

        stopDragging() {
            if (this.dragItem) {
                this.setDragCssClasses(this.dragItem.eDragSource, false);
                this.dragItem = null;
            }
        }

        setDragCssClasses(eListItem: any, dragging: any) {
            utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
            utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
        }

        addDragSource(eDragSource: any, dragSourceCallback: any) {

            this.setDragCssClasses(eDragSource, false);

            eDragSource.addEventListener('mousedown',
                this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
        }

        onMouseDownDragSource(eDragSource: any, dragSourceCallback: any) {
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

        addDropTarget(eDropTarget: any, dropTargetCallback: any) {
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

