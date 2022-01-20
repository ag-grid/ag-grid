import { IStatusPanelComp, IStatusPanelParams } from "@ag-grid-community/core";

export class ClickableStatusBarComponent implements IStatusPanelComp {
    params!: IStatusPanelParams;
    eGui!: HTMLDivElement;
    buttonListener: any;
    visible!: boolean;
    eButton!: HTMLButtonElement;

    init(params: IStatusPanelParams) {
        this.params = params;

        this.visible = true;
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-status-name-value';

        var label = document.createElement('span');
        label.innerText = 'Status Bar Component  ';
        this.eGui.appendChild(label);

        this.eButton = document.createElement('button');

        this.buttonListener = this.onButtonClicked.bind(this);
        this.eButton.addEventListener("click", this.buttonListener);
        this.eButton.innerHTML = 'Click Me';

        this.eGui.appendChild(this.eButton);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eButton.removeEventListener("click", this.buttonListener);
    }

    onButtonClicked() {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
    }

    setVisible(visible: boolean) {
        this.visible = visible;
        this.eGui.style.display = this.visible ? 'block' : 'none';
    }

    isVisible() {
        return this.visible;
    }
}
