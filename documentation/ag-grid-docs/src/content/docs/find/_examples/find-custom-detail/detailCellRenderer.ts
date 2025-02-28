import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.setAttribute('role', 'gridcell');
        const eHeading = document.createElement('h1');
        eHeading.style.padding = '20px';
        this.eGui.appendChild(eHeading);
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        const { api, node } = params;
        const eGui = this.eGui.firstChild!;
        while (eGui.firstChild) {
            eGui.removeChild(eGui.firstChild);
        }
        const cellDisplayValue = 'My Custom Detail';
        const parts = api.findGetParts({
            value: cellDisplayValue,
            node,
            column: null,
        });

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
