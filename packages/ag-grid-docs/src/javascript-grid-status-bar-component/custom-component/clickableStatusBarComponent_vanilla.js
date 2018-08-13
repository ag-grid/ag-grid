function ClickableStatusBarComponent() {
}

ClickableStatusBarComponent.prototype.init = function (params) {
    this.params = params;

    this.eGui = document.createElement('div');
    this.eGui.setAttribute("style", 'margin-right: 5px;background-color: lightgrey; padding-left: 5px; padding-right: 5px; border-radius: 5px');

    var span = document.createElement('span');
    span.innerText = 'Status Bar Component';
    this.eGui.appendChild(span);

    this.eButton = document.createElement('button');
    this.eButton.setAttribute("style", 'margin-left: 5px; padding-top: 0; padding-bottom: 0');

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
