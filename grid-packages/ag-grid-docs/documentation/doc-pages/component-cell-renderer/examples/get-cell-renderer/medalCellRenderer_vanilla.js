// cell renderer class
class MedalCellRenderer {
    constructor() { }

    // init method gets the details of the cell to be renderer
    init(params) {
        this.params = params;
        this.eGui = document.createElement('span');
        this.eGui.innerHTML = new Array(params.value).fill('#').join('');
    }

    getGui() {
        return this.eGui;
    }

    medalUserFunction() {
        console.log(`user function called for medal column: row = ${this.params.rowIndex}, column = ${this.params.column.getId()}`);
    }
}

