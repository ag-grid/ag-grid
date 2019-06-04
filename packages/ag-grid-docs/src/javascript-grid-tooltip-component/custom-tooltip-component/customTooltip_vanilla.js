function CustomTooltip () {}

CustomTooltip.prototype.init = function(params) {
    var eGui = this.eGui = document.createElement('div');
    var color = params.color || 'white';
    var data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;


    eGui.classList.add('custom-tooltip');
    eGui.style['background-color'] = color;
    eGui.innerHTML =
        '<p><span class"name">' + data.athlete + '</span></p>' +
        '<p><span>Country: </span>' + data.country + '</p>' +
        '<p><span>Total: </span>' + data.total + '</p>';
};

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};
