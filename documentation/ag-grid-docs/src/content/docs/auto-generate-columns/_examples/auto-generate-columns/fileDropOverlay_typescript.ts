import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

export class FileDropOverlay implements IOverlayComp {
    private eGui!: HTMLElement;

    public init(params: IOverlayParams): void {
        const eGui = document.createElement('div');
        this.eGui = eGui;
        eGui.className = 'file-drop-overlay';

        const icon = document.createElement('span');
        icon.className = 'file-drop-icon';
        icon.textContent = 'Drop';

        const message = document.createElement('span');
        message.textContent = 'Drop a CSV file here to load data';

        const hint = document.createElement('span');
        hint.className = 'file-drop-hint';
        hint.textContent = 'or click "Load Sample CSV" above';

        eGui.appendChild(icon);
        eGui.appendChild(message);
        eGui.appendChild(hint);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): void {}
}
