function CustomTooltip() { }

CustomTooltip.prototype.init = function(params) {
    var eGui = this.eGui = document.createElement('div'),
        isHeader = params.rowIndex === undefined,
        isGroupedHeader = isHeader && !!params.colDef.children,
        str, valueToDisplay;

    eGui.classList.add('custom-tooltip');

    if (isHeader) {
        str = '<p>Group Name: ' + params.value + '</p>';
        if (isGroupedHeader) {
            str += '<hr>';
            params.colDef.children.forEach(function(header, idx) {
                str += '<p>Child ' + (idx + 1) + ' - ' + header.headerName + '</p>';
            });
        }
        eGui.innerHTML = str;
    } else {
        valueToDisplay = params.value.value ? params.value.value : '- Missing -';

        eGui.innerHTML =
            '<p>Athlete\'s name:</p>' +
            '<p><span class"name">' + valueToDisplay + '</span></p>';
    }
};

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};
