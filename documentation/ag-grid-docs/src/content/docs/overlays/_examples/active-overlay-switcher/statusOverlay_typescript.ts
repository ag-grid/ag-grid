import type { IOverlayComp, IOverlayParams } from 'ag-grid-community';

export interface StatusOverlayParams extends IOverlayParams {
    myCounter?: number;
}

export class StatusOverlay implements IOverlayComp {
    private eGui: HTMLDivElement;
    private eBody: HTMLDivElement;

    public constructor() {
        this.eGui = document.createElement('div');
        this.eBody = document.createElement('div');
    }

    public init(params: StatusOverlayParams): void {
        const { eGui, eBody } = this;

        eGui.className = 'status-overlay';
        eGui.append(eBody);

        this.refresh(params);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: StatusOverlayParams): void {
        this.eBody.innerText = `custom: ${params.myCounter}`;
    }

    public destroy(): void {
        // no-op
    }
}
