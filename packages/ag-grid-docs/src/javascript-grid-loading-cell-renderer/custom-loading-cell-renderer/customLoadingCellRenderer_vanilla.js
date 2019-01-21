function CustomLoadingCellRenderer () {}

CustomLoadingCellRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">' +
        '   <i class="fas fa-spinner fa-pulse"></i> <span>' + params.loadingMessage + ' </span>' +
        '</div>';
};

CustomLoadingCellRenderer.prototype.getGui = function() {
    return this.eGui;
};