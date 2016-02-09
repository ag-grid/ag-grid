/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
/** Functionality for internal DnD functionality between GUI widgets. Eg this service is used to drag columns
 * from the 'available columns' list and putting them into the 'grouped columns' in the tool panel.
 * This service is NOT used by the column headers for resizing and moving, that is a different use case. */
var DragAndDropService = (function () {
    function DragAndDropService() {
    }
    DragAndDropService.prototype.init = function (loggerFactory) {
        this.logger = loggerFactory.create('DragAndDropService');
        // need to clean this up, add to 'finished' logic in grid
        var that = this;
        this.mouseUpEventListener = function listener() {
            that.stopDragging();
        };
        document.addEventListener('mouseup', this.mouseUpEventListener);
        this.logger.log('initialised');
    };
    DragAndDropService.prototype.destroy = function () {
        document.removeEventListener('mouseup', this.mouseUpEventListener);
        this.logger.log('destroyed');
    };
    DragAndDropService.prototype.stopDragging = function () {
        if (this.dragItem) {
            this.setDragCssClasses(this.dragItem.eDragSource, false);
            this.dragItem = null;
        }
    };
    DragAndDropService.prototype.setDragCssClasses = function (eListItem, dragging) {
        utils_1.default.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
        utils_1.default.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
    };
    DragAndDropService.prototype.addDragSource = function (eDragSource, dragSourceCallback) {
        this.setDragCssClasses(eDragSource, false);
        eDragSource.addEventListener('mousedown', this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
    };
    DragAndDropService.prototype.onMouseDownDragSource = function (eDragSource, dragSourceCallback) {
        if (this.dragItem) {
            this.stopDragging();
        }
        var data;
        if (dragSourceCallback.getData) {
            data = dragSourceCallback.getData();
        }
        var containerId;
        if (dragSourceCallback.getContainerId) {
            containerId = dragSourceCallback.getContainerId();
        }
        this.dragItem = {
            eDragSource: eDragSource,
            data: data,
            containerId: containerId
        };
        this.setDragCssClasses(this.dragItem.eDragSource, true);
    };
    DragAndDropService.prototype.addDropTarget = function (eDropTarget, dropTargetCallback) {
        var mouseIn = false;
        var acceptDrag = false;
        var that = this;
        eDropTarget.addEventListener('mouseover', function () {
            if (!mouseIn) {
                mouseIn = true;
                if (that.dragItem) {
                    acceptDrag = dropTargetCallback.acceptDrag(that.dragItem);
                }
                else {
                    acceptDrag = false;
                }
            }
        });
        eDropTarget.addEventListener('mouseout', function () {
            if (acceptDrag) {
                dropTargetCallback.noDrop();
            }
            mouseIn = false;
            acceptDrag = false;
        });
        eDropTarget.addEventListener('mouseup', function () {
            // dragItem should never be null, checking just in case
            if (acceptDrag && that.dragItem) {
                dropTargetCallback.drop(that.dragItem);
            }
        });
    };
    return DragAndDropService;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DragAndDropService;
