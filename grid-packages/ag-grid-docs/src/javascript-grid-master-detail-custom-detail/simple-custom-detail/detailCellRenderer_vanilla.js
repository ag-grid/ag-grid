function DetailCellRenderer() {}

DetailCellRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<h1 style="padding: 20px;">My Custom Detail</h1>';
};

DetailCellRenderer.prototype.getGui = function() {
    return this.eGui;
};
