// cell renderer class
class MedalCellRenderer {
    constructor() {
    }

    // init method gets the details of the cell to be renderer
    init(params) {
        this.eGui = document.createElement('span');
        this.eGui.innerHTML = new Array(parseInt(params.value, 10)).fill('#').join('');
    }

    getGui() {
        return this.eGui;
    }
}

