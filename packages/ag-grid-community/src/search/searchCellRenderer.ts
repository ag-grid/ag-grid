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
        const activeMatchNum = search?.getActiveMatchNum(node, column!);
        const searchText = search?.searchText;
        const displayValue = valueFormatted ?? value ?? '';
        const valueToSearch = _escapeString(displayValue, true)?.toLocaleUpperCase() ?? '';
        const eGui = this.getGui();
        _clearElement(eGui);
        if (_missing(searchText)) {
            eGui.textContent = _escapeString(displayValue, true) ?? '';
            return true;
        }

        let lastIndex = 0;
        let currentMatchNum = 0;
        const searchTextLength = searchText.length;
        const parts: { value: string; match?: boolean; activeMatch?: boolean }[] = [];
        while (true) {
            const index = valueToSearch.indexOf(searchText, lastIndex === 0 ? 0 : lastIndex + 1);
            if (index != -1) {
                currentMatchNum++;
                if (index > lastIndex) {
                    parts.push({ value: displayValue.slice(lastIndex, index) });
                }
                const endIndex = index + searchTextLength;
                parts.push({
                    value: displayValue.slice(index, endIndex),
                    match: true,
                    activeMatch: currentMatchNum === activeMatchNum,
                });
                lastIndex = endIndex;
            } else {
                if (lastIndex < displayValue.length) {
                    parts.push({
                        value: displayValue.slice(lastIndex),
                    });
                }
                break;
            }
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
