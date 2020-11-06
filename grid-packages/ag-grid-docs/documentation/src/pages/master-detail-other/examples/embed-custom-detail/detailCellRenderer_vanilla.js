function DetailCellRenderer() {}

DetailCellRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<h1 class="custom-detail" style="padding: 20px;">'+(params.pinned ? params.pinned : 'center')+'</h1>';
};

DetailCellRenderer.prototype.getGui = function() {
    return this.eGui;
};
