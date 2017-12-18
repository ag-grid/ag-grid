function CustomLoadingOverlayRenderer () {}

CustomLoadingOverlayRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.className = "ag-overlay-panel";
    this.eGui.innerHTML =
        '<div class="ag-overlay-panel">' +
        '  <div class="ag-overlay-wrapper ag-overlay-loading-wrapper">' +
        '  <div class="ag-overlay-loading-center" style="background-color: lightsteelblue; height: 9%">' +
        '       <div><i class="fa fa-hourglass-1"> One moment please...</i></div>' +
        '  </div> ' +
        '  </div>' +
        '</div>';
};

CustomLoadingOverlayRenderer.prototype.getGui = function() {
    return this.eGui;
};