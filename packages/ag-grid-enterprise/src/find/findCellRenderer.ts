import type { ElementParams, ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { Component, _clearElement, _createElement, _escapeString } from 'ag-grid-community';

const FindCellRendererElement: ElementParams = { tag: 'span', cls: 'ag-find-cell' };
export class FindCellRenderer extends Component implements ICellRenderer {
    constructor() {
        super(FindCellRendererElement);
    }

    public init(params: ICellRendererParams): void {
        this.refresh(params);
    }

    public refresh(params: ICellRendererParams): boolean {
        const { node, column } = params;
        const findSvc = this.beans.findSvc;
        const displayValue = findSvc?.getDisplayValue(params) ?? '';
        const eGui = this.getGui();
        _clearElement(eGui);
        const parts = findSvc?.getParts({ value: displayValue, node, column: column ?? null });
        if (!parts) {
            eGui.textContent = _escapeString(displayValue, true) ?? '';
            eGui.classList.remove('ag-find-cell-active-match');
            return true;
        }
        let hasActiveMatch = false;
        for (const { value: partValue, match, activeMatch } of parts) {
            const content = _escapeString(partValue, true) ?? '';
            if (match) {
                const element = _createElement({ tag: 'mark', cls: 'ag-find-match' });
                element.textContent = content;
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
