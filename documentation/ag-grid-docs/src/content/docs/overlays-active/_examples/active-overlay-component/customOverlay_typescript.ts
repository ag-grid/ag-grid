import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

export interface CustomParams {
    count: number;
}

export class CustomOverlay implements IOverlayComp {
    private eGui!: HTMLElement;
    private eCount!: HTMLElement;
    private eStatus!: HTMLElement;

    public init(params: IOverlayParams & CustomParams): void {
        const eGui = document.createElement('div');
        this.eGui = eGui;
        eGui.className = 'my-custom-overlay';

        const eCount = document.createElement('span');
        const eStatus = document.createElement('span');
        eStatus.className = 'visually-hidden';
        eStatus.setAttribute('role', 'status');
        eStatus.setAttribute('aria-live', 'polite');
        eStatus.setAttribute('aria-atomic', 'true');

        eGui.append('Custom Overlay: ', eCount, eStatus);
        this.eCount = eCount;
        this.eStatus = eStatus;

        this.refresh(params);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IOverlayParams & CustomParams): void {
        const count = String(params.count);
        this.eCount.textContent = count;
        this.eStatus.textContent = `Custom overlay shown. Count ${count}.`;
    }
}
