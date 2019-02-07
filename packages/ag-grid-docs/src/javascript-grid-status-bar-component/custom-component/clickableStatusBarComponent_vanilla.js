function ClickableStatusBarComponent() {
}

ClickableStatusBarComponent.prototype.init = function (params) {
    this.params = params;

    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-name-value';

    var label = document.createElement('span');
    label.innerText = 'Status Bar Component ';
    this.eGui.appendChild(label);

    this.eButton = document.createElement('button');

    this.buttonListener = this.onButtonClicked.bind(this);
    this.eButton.addEventListener("click", this.buttonListener);
    this.eButton.innerHTML = 'Click Me';

    this.eGui.appendChild(this.eButton);
};

ClickableStatusBarComponent.prototype.getGui = function () {
    return this.eGui;
};

ClickableStatusBarComponent.prototype.destroy = function () {
    this.eButton.removeEventListener("click", this.buttonListener);
};

ClickableStatusBarComponent.prototype.onButtonClicked = function () {
    alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
};
