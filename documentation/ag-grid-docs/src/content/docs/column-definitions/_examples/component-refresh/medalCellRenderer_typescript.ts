import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class MedalCellRenderer implements ICellRendererComp {
    private eGui: HTMLElement | undefined;

    init(params: ICellRendererParams): void {
        console.log('renderer created');
        this.eGui = document.createElement('span');
        this.updateDisplayValue(params);
    }

    getGui(): HTMLElement {
        return this.eGui!;
    }

    refresh(params: ICellRendererParams): boolean {
        console.log('renderer refreshed');
        this.updateDisplayValue(params);
        return true;
    }

    private updateDisplayValue(params: ICellRendererParams): void {
        this.eGui!.textContent = new Array(params.value!).fill('#').join('');
    }
}
