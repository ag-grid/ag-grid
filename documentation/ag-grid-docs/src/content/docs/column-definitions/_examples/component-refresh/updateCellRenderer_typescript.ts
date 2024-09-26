import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class UpdateCellRenderer implements ICellRendererComp {
    private eGui: HTMLElement | undefined;
    private params!: ICellRendererParams;

    init(params: ICellRendererParams): void {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '<button>Update Data</button>';
        this.eGui.addEventListener('click', () => this.onClick());
        this.params = params;
    }

    getGui(): HTMLElement {
        return this.eGui!;
    }

    refresh(): boolean {
        return false;
    }

    onClick(): void {
        const { node } = this.params;
        const { gold, silver, bronze } = node.data;
        node.updateData({
            ...node.data,
            gold: gold + 1,
            silver: silver + 1,
            bronze: bronze + 1,
        });
    }
}
