function CountStatusBarComponent() {
}

CountStatusBarComponent.prototype.init = function (params) {
    this.params = params;

    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-status-name-value';

    var label = document.createElement('span');
    label.innerText = 'Row Count Component: ';
    this.eGui.appendChild(label);

    this.eCount = document.createElement('span');
    this.eCount.className = 'ag-status-name-value-value';

    this.eGui.appendChild(this.eCount);

    params.api.addEventListener('gridReady', this.onGridReady.bind(this));
};

CountStatusBarComponent.prototype.getGui = function () {
    return this.eGui;
};

CountStatusBarComponent.prototype.destroy = function () {
    this.params.removeEventListener("gridReady", this.onGridReady);
};

CountStatusBarComponent.prototype.onGridReady = function () {
    this.eCount.innerText = this.params.api.getModel().rowsToDisplay.length
 };
