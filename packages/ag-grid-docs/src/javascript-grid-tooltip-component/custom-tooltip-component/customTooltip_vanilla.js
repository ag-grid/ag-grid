function CustomTooltip () {}

CustomTooltip.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.classList.add('custom-tooltip');
    var data = params.api.getRowNode(params.rowIndex).data;
    this.eGui.innerHTML =
        '<p><span class"name">' + data.athlete + '</span></p>' +
        '<p><span>Country: </span>' + data.country + '</p>' +
        '<p><span>Total: </span>' + data.total + '</p>';
};

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};

CustomTooltip.prototype.destroy = function() {
    var eGui = this.getGui();
    var parent = eGui.parentElement;

    if (parent) {
        parent.remove(eGui);
    }
};