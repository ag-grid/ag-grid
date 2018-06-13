function CustomNoRowsOverlay () {}

CustomNoRowsOverlay.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div class="ag-overlay-loading-center" style="background-color: lightcoral; height: 9%">' +
        '   <i class="fa fa-frown-o"> ' + params.noRowsMessageFunc() + ' </i>' +
        '</div>';
};

CustomNoRowsOverlay.prototype.getGui = function() {
    return this.eGui;
};