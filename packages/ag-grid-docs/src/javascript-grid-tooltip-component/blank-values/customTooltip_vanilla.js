function CustomTooltip () {}

CustomTooltip.prototype.init = function(params) {
    var eGui = this.eGui = document.createElement('div');
    eGui.classList.add('custom-tooltip');

    var valueToDisplay = params.value.value ? params.value.value : '- Missing -';

    eGui.innerHTML =
        '<p>Athletes name:</p>' +
        '<p><span class"name">' + valueToDisplay + '</span></p>';
};

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};
