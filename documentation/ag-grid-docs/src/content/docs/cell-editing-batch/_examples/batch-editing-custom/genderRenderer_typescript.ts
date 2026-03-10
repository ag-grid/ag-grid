import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class GenderRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;
    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.updateGui(params.value);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        this.updateGui(params.value);
        return true;
    }

    private updateGui(value: string) {
        if (value) {
            const icon = value === 'Male' ? 'fa-male' : 'fa-female';
            this.eGui.innerHTML = `<i class="fa ${icon}"></i> ${value}`;
        } else {
            this.eGui.innerHTML = '';
        }
    }
}
