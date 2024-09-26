import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class SimpleCellRenderer implements ICellRendererComp {
    eGui: any;

    init(params: ICellRendererParams) {
        const tempDiv = document.createElement('div');
        const color = params.node.group ? '#CC222244' : '#33CC3344';
        tempDiv.innerHTML = `<span style="background-color: ${color}; padding: 2px; ">${params.value}</span>`;
        this.eGui = tempDiv.firstChild!;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
