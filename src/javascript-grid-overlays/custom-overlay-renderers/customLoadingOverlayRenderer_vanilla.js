function CustomLoadingOverlayRenderer () {}

CustomLoadingOverlayRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div class="ag-overlay-loading-center" style="background-color: lightsteelblue; height: 9%">' +
        '   <i class="fa fa-hourglass-1"> One moment please...</i>' +
        '</div>';
};

CustomLoadingOverlayRenderer.prototype.getGui = function() {
    return this.eGui;
};