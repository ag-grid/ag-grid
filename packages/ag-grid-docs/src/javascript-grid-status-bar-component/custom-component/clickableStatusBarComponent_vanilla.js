function ClickableStatusBarComponent() {
}

ClickableStatusBarComponent.prototype.init = function (params) {
    this.params = params;

    this.eGui = document.createElement('div');

    var content = document.createElement('div');
    var span = document.createElement('span');
    span.innerText = 'Status Bar Component';
    content.appendChild(span);

    this.eButton = document.createElement('button');

    this.buttonListener = this.onButtonClicked.bind(this);
    this.eButton.addEventListener("click", this.buttonListener);
    this.eButton.innerHTML = 'Click Me';
    content.appendChild(this.eButton);
    
    this.eGui.appendChild(content);
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
