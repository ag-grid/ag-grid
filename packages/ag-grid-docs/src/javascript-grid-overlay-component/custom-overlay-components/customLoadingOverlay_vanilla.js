function CustomLoadingOverlay () {}

CustomLoadingOverlay.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div class="ag-overlay-loading-center" style="background-color: lightsteelblue; height: 9%">' +
        '   <i class="fas fa-hourglass-half"> ' + params.loadingMessage + ' </i>' +
        '</div>';
};

CustomLoadingOverlay.prototype.getGui = function() {
    return this.eGui;
};