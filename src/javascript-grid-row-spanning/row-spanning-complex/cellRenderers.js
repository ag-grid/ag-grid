function ShowCellRenderer(){}

ShowCellRenderer.prototype.init = function(params) {
    var cellBlank = !params.value;
    if (cellBlank) { return null; }

    this.ui = document.createElement('div');
    this.ui.innerHTML =
        '<div class="show-name">'
            +params.value.name+'' +
        '</div>' +
        '<div class="show-presenter">'
            +params.value.presenter +
        '</div>';
};

ShowCellRenderer.prototype.getGui = function() {
    return this.ui;
};
