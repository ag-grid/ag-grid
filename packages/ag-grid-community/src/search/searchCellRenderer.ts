import type { ICellRenderer, ICellRendererParams } from '../rendering/cellRenderers/iCellRenderer';
import { _setDisplayed } from '../utils/dom';
import { _escapeString } from '../utils/string';
import { Component, RefPlaceholder } from '../widgets/component';

export class SearchCellRenderer extends Component implements ICellRenderer {
    private readonly ePre: HTMLElement = RefPlaceholder;
    private readonly eMatch: HTMLElement = RefPlaceholder;
    private readonly ePost: HTMLElement = RefPlaceholder;

    constructor() {
        super(/* html */ `
            <span>
                <span data-ref="ePre"></span><span data-ref="eMatch" class="ag-search-match"></span><span data-ref="ePost"></span>
            </span>
        `);
    }

    public init(params: any): void {
        this.refresh(params);
    }

    public refresh(params: ICellRendererParams<any, any, any>): boolean {
        const { node, column, valueFormatted, value } = params;
        const search = this.beans.search;
        const activeMatch = search?.isActiveMatch({
            rowIndex: node.rowIndex!,
            rowPinned: node.rowPinned,
            column: column!,
        });
        const searchText = search?.searchText;
        const displayValue = valueFormatted ?? value;
        const valueToSearch = _escapeString(displayValue, true)?.toLocaleUpperCase() ?? '';
        const startIndex = searchText != null ? valueToSearch.indexOf(searchText) : -1;
        if (startIndex != -1) {
            const displayValueLength = displayValue.length;
            const endIndex = startIndex + searchText!.length;
            const showPre = startIndex !== 0;
            _setDisplayed(this.ePre, showPre);
            this.ePre.textContent = showPre ? _escapeString(displayValue.slice(0, startIndex)) : '';
            _setDisplayed(this.eMatch, true);
            this.eMatch.textContent = _escapeString(displayValue.slice(startIndex, endIndex));
            this.eMatch.classList.toggle('ag-search-active-match', activeMatch);
            const showPost = endIndex !== displayValueLength;
            _setDisplayed(this.ePost, showPost);
            this.ePost.textContent = showPost ? _escapeString(displayValue.slice(endIndex)) : '';
        } else {
            this.ePre.textContent = _escapeString(displayValue);
            _setDisplayed(this.ePre, true);
            this.eMatch.textContent = '';
            _setDisplayed(this.eMatch, false);
            this.ePost.textContent = '';
            _setDisplayed(this.ePost, false);
        }

        return true;
    }
}
