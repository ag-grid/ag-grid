function CustomTooltip() { }

CustomTooltip.prototype.init = function(params) {
    var eGui = (this.eGui = document.createElement('div'));

    eGui.classList.add('custom-tooltip');

    if (params.rowIndex != null) {
        eGui.innerHTML = '<strong>Row ' + params.rowIndex + ':</strong> ' + params.value;
    } else {
        eGui.innerHTML = params.value;
    }
};

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};
