function setStyle(element, propertyObject) {
    for (var property in propertyObject) {
        element.style[property] = propertyObject[property];
    }
}
function CustomPinnedRowRenderer () {}

CustomPinnedRowRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    setStyle(this.eGui, params.style);
    this.eGui.innerHTML = params.value;
};

CustomPinnedRowRenderer.prototype.getGui = function() {
    return this.eGui;
};
