import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class FullWidthCellRenderer implements ICellRendererComp {
    private eGui: HTMLElement | undefined;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement("div");
        this.eGui.classList.add('full-width-panel');
        this.eGui.innerHTML = `
            <button><img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/flags/${params.data.code}.png"></button>
            <input value="${params.data.name}"/>
            <a href="https://www.google.com/search?q=${params.data.language}" target="_blank">${params.data.language}</a>
        `;
    }

    getGui() {
        return this.eGui!;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
    