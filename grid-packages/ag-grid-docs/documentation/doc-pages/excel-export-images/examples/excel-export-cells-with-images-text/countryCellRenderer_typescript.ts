import { ICellRendererParams, ICellRendererComp } from "@ag-grid-community/core";

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLImageElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('img');
        this.eGui.alt = params.data;

        const context: any = (params as any).context;
        this.eGui.src = context.base64flags[context.countryCodes[params.data.country]];
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}

