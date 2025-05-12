import type { IStatusPanelComp, IStatusPanelParams } from 'ag-grid-community';

export class ClickableStatusBarComponent implements IStatusPanelComp {
    params!: IStatusPanelParams;
    eGui!: HTMLDivElement;
    buttonListener: any;
    visible!: boolean;
    eButton!: HTMLButtonElement;
    eText!: HTMLSpanElement;

    init(params: IStatusPanelParams) {
        this.params = params;

        this.visible = true;
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-status-name-value';

        const label = document.createElement('span');
        label.textContent = 'Status Bar Component  ';
        this.eGui.appendChild(label);

        this.eButton = document.createElement('button');

        this.buttonListener = this.onButtonClicked.bind(this);
        this.eButton.addEventListener('click', this.buttonListener);
        this.eButton.textContent = 'Click Me';

        this.eGui.appendChild(this.eButton);

        this.eText = document.createElement('span');
        this.eGui.appendChild(this.eText);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eButton.removeEventListener('click', this.buttonListener);
    }

    onButtonClicked() {
        this.eText.textContent = ' ' + this.params.api.getSelectedRows().length + ' selected';
    }

    setVisible(visible: boolean) {
        this.visible = visible;
        this.eGui.style.display = this.visible ? 'block' : 'none';
    }

    isVisible() {
        return this.visible;
    }
}
