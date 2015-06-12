
function DragController() {

}

DragController.prototype.addDragSource = function(eDragSource) {
    var that = this;
    eDragSource.addEventListener('mousedown', function(downEvent) {
        //dragCallback.onDragStart();
        that.eRoot.style.cursor = "move";

        //that.eRoot.onmousemove = function(moveEvent) {
        //    //dragCallback.onDragging(change);
        //};
        //that.eRoot.onmouseup = function() {
        //    that.stopDragging();
        //};
        //that.eRoot.onmouseleave = function() {
        //    that.stopDragging();
        //};
    });
};

module.exports = DragController;