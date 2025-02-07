import type { ICellRenderer, ICellRendererParams } from '../rendering/cellRenderers/iCellRenderer';
import { _clearElement } from '../utils/dom';
import { _escapeString } from '../utils/string';
import { Component } from '../widgets/component';

export class SearchCellRenderer extends Component implements ICellRenderer {
    constructor() {
        super(/* html */ `<span></span>`);
    }

    public init(params: any): void {
        this.refresh(params);
    }

    public refresh(params: ICellRendererParams<any, any, any>): boolean {
        const { node, column, valueFormatted, value } = params;
        const displayValue = valueFormatted ?? value ?? '';
        const eGui = this.getGui();
        _clearElement(eGui);
        const parts = column ? this.beans.search?.getParts({ value: displayValue, node, column }) : undefined;
        if (!parts) {
            eGui.textContent = _escapeString(displayValue, true) ?? '';
            return true;
        }
        for (const { value: partValue, match, activeMatch } of parts) {
            const content = _escapeString(partValue, true) ?? '';
            if (match) {
                const element = document.createElement('mark');
                element.textContent = content;
                element.classList.add('ag-search-match');
                if (activeMatch) {
                    element.classList.add('ag-search-active-match');
                }
                eGui.appendChild(element);
            } else {
                eGui.appendChild(document.createTextNode(content));
            }
        }

        return true;
    }
}
