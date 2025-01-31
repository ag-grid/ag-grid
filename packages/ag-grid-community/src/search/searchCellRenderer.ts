import type { ICellRenderer, ICellRendererParams } from '../rendering/cellRenderers/iCellRenderer';
import { _clearElement } from '../utils/dom';
import { _missing } from '../utils/generic';
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
        const search = this.beans.search;
        const activeMatchNum = search?.getActiveMatchNum({
            rowIndex: node.rowIndex!,
            rowPinned: node.rowPinned,
            column: column!,
        });
        const searchText = search?.searchText;
        const displayValue = valueFormatted ?? value;
        const valueToSearch = _escapeString(displayValue, true)?.toLocaleUpperCase() ?? '';
        const eGui = this.getGui();
        _clearElement(eGui);
        if (_missing(searchText)) {
            const eSpan = document.createElement('span');
            eSpan.textContent = _escapeString(displayValue);
            eGui.appendChild(eSpan);
            return true;
        }

        let lastIndex = 0;
        let currentMatchNum = 0;
        const searchTextLength = searchText.length;
        while (true) {
            const index = valueToSearch.indexOf(searchText, lastIndex === 0 ? 0 : lastIndex + 1);
            if (index != -1) {
                currentMatchNum++;
                if (index > lastIndex) {
                    const eSpan = document.createElement('span');
                    eSpan.textContent = _escapeString(displayValue.slice(lastIndex, index));
                    eGui.appendChild(eSpan);
                }
                const endIndex = index + searchTextLength;
                const eSpan = document.createElement('span');
                eSpan.textContent = _escapeString(displayValue.slice(index, endIndex));
                eSpan.classList.add('ag-search-match');
                if (currentMatchNum === activeMatchNum) {
                    eSpan.classList.add('ag-search-active-match');
                }
                eGui.appendChild(eSpan);
                lastIndex = endIndex;
            } else {
                if (lastIndex < displayValue.length) {
                    const eSpan = document.createElement('span');
                    eSpan.textContent = _escapeString(displayValue.slice(lastIndex));
                    eGui.appendChild(eSpan);
                }
                break;
            }
        }

        return true;
    }
}
