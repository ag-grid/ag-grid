function CustomCellComponent() {
}

CustomCellComponent.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.classList.add('my-custom-cell-renderer');
    var content = '';
    content += '<div class="athlete-info">'
    content +=     '<span>' + params.data.athlete + '</span>';
    content +=     '<span>' + params.data.country + '</span>';
    content += '</div>';
    content += '<span>' + params.data.year + '</span>';

    this.eGui.innerHTML = content;

    // creates the row dragger element
    var rowDragger = document.createElement('i');
    content += '<i class="fas fa-arrows-alt-v"></i>';
    rowDragger.classList.add('fas');
    rowDragger.classList.add('fa-arrows-alt-v');
    this.eGui.appendChild(rowDragger);

    // registers as a row dragger
    params.registerRowDragger(rowDragger);
};

CustomCellComponent.prototype.getGui = function() {
    return this.eGui;
};