import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class FindRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        const { api, value, valueFormatted, column, node } = params;
        const eGui = this.eGui;
        while (eGui.firstChild) {
            eGui.removeChild(eGui.firstChild);
        }
        const cellValue = valueFormatted ?? value?.toString();
        if (cellValue == null || cellValue === '') {
            return true;
        }
        const cellDisplayValue = `Year is ${cellValue}`;
        const parts =
            column != null
                ? api.findGetParts({
                      value: cellDisplayValue,
                      node,
                      column,
                  })
                : [];

        if (!parts.length) {
            eGui.textContent = cellDisplayValue;
            return true;
        }

        for (const { value: partValue, match, activeMatch } of parts) {
            if (match) {
                const element = document.createElement('mark');
                element.textContent = partValue;
                element.classList.add('ag-find-match');
                if (activeMatch) {
                    element.classList.add('ag-find-active-match');
                }
                eGui.appendChild(element);
            } else {
                eGui.appendChild(document.createTextNode(partValue));
            }
        }

        return true;
    }
}
