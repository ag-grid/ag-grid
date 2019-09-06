function DragSourceRenderer() {
}

DragSourceRenderer.prototype.init = function (params) {

    var eTemp = document.createElement('div');
    eTemp.innerHTML = '<div draggable="true">Drag Me!</div>';

    this.eGui = eTemp.firstChild;
    this.rowNode = params.node;

    this.onDragStartListener = this.onDragStart.bind(this);
    this.eGui.addEventListener('dragstart', this.onDragStartListener)
};

DragSourceRenderer.prototype.onDragStart = function (dragEvent) {
    var userAgent = window.navigator.userAgent;
    var isIE = userAgent.indexOf('Trident/') >= 0;
    dragEvent.dataTransfer.setData(isIE ? 'text' : 'text/plain', 'Dragged item with ID: ' + this.rowNode.data.id);
};

DragSourceRenderer.prototype.getGui = function () {
    return this.eGui;
};

DragSourceRenderer.prototype.destroy = function () {
    this.eGui.removeEventListener('dragstart', this.onDragStartListener)
};
