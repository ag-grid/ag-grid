import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CompanyLogoRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        const companyLogo: HTMLImageElement = document.createElement('img');
        companyLogo.src = `https://www.ag-grid.com/example-assets/software-company-logos/${params.value.toLowerCase()}.svg`;
        companyLogo.setAttribute('class', 'logo');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('class', 'imgSpanLogo');
        this.eGui.appendChild(companyLogo);
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() {
        return this.eGui;
    }

    // Required: Get the cell to refresh.
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
