import type { ICellRendererParams } from 'ag-grid-community';

export class SlowRenderer {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams) {
        const delay = 50;
        const start = Date.now();
        while (Date.now() - start < delay) {
            // Busy-waiting loop to simulate a delay
        }
        this.eGui.textContent = params.value;
        return true;
    }

    destroy() {}
}
