import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class AthleteCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    params!: ICellRendererParams<IOlympicData, string>;

    // init method gets the details of the cell to be renderer
    init(params: ICellRendererParams<IOlympicData, string>) {
        this.params = params;
        const div: HTMLElement = document.createElement('div');
        div.style.overflow = 'hidden';
        div.style.textOverflow = 'ellipsis';
        div.textContent = params.value || '';
        this.eGui = div;
        params.setTooltip(`Dynamic Tooltip for ${params.value}`, () => this.eGui.scrollWidth > this.eGui.clientWidth);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
