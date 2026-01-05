import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

export interface CustomParams {
    count: number;
}

export class CustomOverlay implements IOverlayComp {
    private eGui!: HTMLElement;

    public init(params: IOverlayParams & CustomParams): void {
        const eGui = document.createElement('div');
        this.eGui = eGui;
        eGui.className = 'my-custom-overlay';
        this.refresh(params);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IOverlayParams & CustomParams) {
        this.eGui.textContent = 'Custom Overlay: ' + params.count;
    }
}
