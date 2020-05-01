function CustomTooltip () {}

CustomTooltip.prototype.init = function(params) {
    var type = params.type || 'primary';
    var data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
    var eGui = this.eGui = document.createElement('div');

    eGui.classList.add('custom-tooltip');
    this.eGui.innerHTML =
        '<div class="panel panel-' + type + '">' +
            '<div class="panel-heading">' +
                '<h3 class="panel-title">' + data.country + '</h3>' +
            '</div>' +
            '<div class="panel-body">' +
                '<h4 style="white-space: nowrap;">' + data.athlete + '</h4>' +
                '<p>Total: ' + data.total + '</p>' +
            '</div>' +
        '</div>';
    };

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};
