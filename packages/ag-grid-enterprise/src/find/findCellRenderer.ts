import type { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { Component, _clearElement, _escapeString } from 'ag-grid-community';

export class FindCellRenderer extends Component implements ICellRenderer {
    constructor() {
        super(/* html */ `<span class="ag-find-cell"></span>`);
    }

    public init(params: ICellRendererParams): void {
        this.refresh(params);
    }

    public refresh(params: ICellRendererParams): boolean {
        const { node, column, valueFormatted, value } = params;
        const { footerSvc, findSvc } = this.beans;
        const displayValue = (node.footer ? footerSvc?.getTotalValue(value) : valueFormatted ?? value) ?? '';
        const eGui = this.getGui();
        _clearElement(eGui);
        const parts = column ? findSvc?.getParts({ value: displayValue, node, column }) : undefined;
        if (!parts) {
            eGui.textContent = _escapeString(displayValue, true) ?? '';
            eGui.classList.remove('ag-find-cell-active-match');
            return true;
        }
        let hasActiveMatch = false;
        for (const { value: partValue, match, activeMatch } of parts) {
            const content = _escapeString(partValue, true) ?? '';
            if (match) {
                const element = document.createElement('mark');
                element.textContent = content;
                element.classList.add('ag-find-match');
                if (activeMatch) {
                    element.classList.add('ag-find-active-match');
                    hasActiveMatch = true;
                }
                eGui.appendChild(element);
            } else {
                eGui.appendChild(document.createTextNode(content));
            }
        }
        eGui.classList.toggle('ag-find-cell-active-match', hasActiveMatch);

        return true;
    }
}
