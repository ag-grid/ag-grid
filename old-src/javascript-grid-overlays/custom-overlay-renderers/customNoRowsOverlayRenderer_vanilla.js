function CustomNoRowsOverlayRenderer () {}

CustomNoRowsOverlayRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.className = "ag-overlay-panel";
    this.eGui.innerHTML =
        '<div class="ag-overlay-panel">' +
        '  <div class="ag-overlay-wrapper ag-overlay-loading-wrapper">' +
        '  <div class="ag-overlay-loading-center" style="background-color: lightcoral; height: 9%">' +
        '       <div><i class="fa fa-frown-o"> Sorry - no rows!</i></div>' +
        '  </div> ' +
        '  </div>' +
        '</div>';
};

CustomNoRowsOverlayRenderer.prototype.getGui = function() {
    return this.eGui;
};