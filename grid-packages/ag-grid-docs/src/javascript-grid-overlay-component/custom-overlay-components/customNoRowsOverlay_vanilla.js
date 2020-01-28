function CustomNoRowsOverlay () {}

CustomNoRowsOverlay.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div class="ag-overlay-loading-center" style="background-color: lightcoral;">' +
        '   <i class="far fa-frown"> ' + params.noRowsMessageFunc() + ' </i>' +
        '</div>';
};

CustomNoRowsOverlay.prototype.getGui = function() {
    return this.eGui;
};