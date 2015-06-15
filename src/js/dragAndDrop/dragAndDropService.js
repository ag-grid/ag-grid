var utils = require('../utils');

function DragAndDropService() {
    document.addEventListener('mouseup', this.stopDragging.bind(this));
}

DragAndDropService.prototype.stopDragging = function() {
    if (this.dragItem) {
        this.setDragCssClasses(this.dragItem.eDragSource, false);
        this.dragItem = null;
    }
};

DragAndDropService.prototype.setDragCssClasses = function(eListItem, dragging) {
    utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
    utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
};

DragAndDropService.prototype.addDragSource = function(eDragSource, dragSourceCallback, containerId) {

    this.setDragCssClasses(eDragSource, false);

    var mouseDown = false;
    var that = this;

    eDragSource.addEventListener('mousedown', function() {
        mouseDown = true;
    });

    eDragSource.addEventListener('mouseup', function() {
        mouseDown = false;
    });

    eDragSource.addEventListener('mouseout', function() {
        mouseDown = false;
    });

    eDragSource.addEventListener('mousemove', function() {
        if (mouseDown) {
            var alreadyDraggingThisItem = this.dragItem && this.dragItem.eDropSource === eDragSource;
            if (!alreadyDraggingThisItem) {
                that.startDragging(eDragSource, dragSourceCallback, containerId);
            }
        }
    });
};

DragAndDropService.prototype.startDragging = function(eDragSource, dragSourceCallback) {
    if (this.dragItem && this.dragItem.eDragSource === eDragSource) {
        return;
    }
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

DragAndDropService.prototype.addDropTarget = function(eDropTarget, dropTargetCallback) {
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

};

module.exports = new DragAndDropService();