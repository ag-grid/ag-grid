function ClickableStatusBarComponent() {
}

ClickableStatusBarComponent.prototype.init = function (params) {
    this.params = params;

    this.visible = true;

    this.eGui = document.createElement('div');
    this.eGui.setAttribute("style",
        'display: flex; justify-content: center; flex-direction: column;margin: 5px;' +
        'background-color: lightgrey; padding-left: 5px; padding-right: 5px; border-radius: 5px'
    );

    var content = document.createElement('div');
    var span = document.createElement('span');
    span.innerText = 'Status Bar Component';
    content.appendChild(span);

    this.eButton = document.createElement('button');
    this.eButton.setAttribute("style", 'margin-left: 5px; padding-top: 0; padding-bottom: 0');

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

ClickableStatusBarComponent.prototype.setVisible = function (visible) {
    this.visible = visible;

    this.eGui.style.display = this.visible ? 'flex' : 'none';
};

ClickableStatusBarComponent.prototype.isVisible = function () {
    return this.visible;
};
