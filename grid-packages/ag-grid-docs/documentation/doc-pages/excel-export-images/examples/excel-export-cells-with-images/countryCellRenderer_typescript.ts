import { ICellRendererParams, ICellRendererComp } from "@ag-grid-community/core";
import { FlagContext } from './interfaces';

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLImageElement;

    init(params: ICellRendererParams<IOlympicData, any, FlagContext>) {
        this.eGui = document.createElement('img');
        const country = params.data!.country;
        this.eGui.alt = country;

        const context = params.context;
        this.eGui.src = context.base64flags[context.countryCodes[country]];
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}

