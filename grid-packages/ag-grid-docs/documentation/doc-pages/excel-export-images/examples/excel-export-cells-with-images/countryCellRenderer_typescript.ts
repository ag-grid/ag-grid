import { ICellRendererParams, ICellRendererComp } from "@ag-grid-community/core";
import { FlagContext, IOlympicData } from './interfaces';

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLImageElement;

    init(params: ICellRendererParams<IOlympicData, any, FlagContext>) {
        this.eGui = document.createElement('img');
        this.eGui.alt = params.data!.country;

        const context = params.context;
        this.eGui.src = context.base64flags[context.countryCodes[params.data!.country]];
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}

