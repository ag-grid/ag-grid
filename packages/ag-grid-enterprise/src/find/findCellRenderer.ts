import type { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { Component, _clearElement, _escapeString, _getInnerWidth } from 'ag-grid-community';

export class FindCellRenderer extends Component implements ICellRenderer {
    private params: ICellRendererParams;
    private parts?: { value: string; match?: boolean; activeMatch?: boolean }[];

    constructor() {
        super(/* html */ `<span class="ag-find-cell"></span>`);
    }

    public init(params: ICellRendererParams): void {
        this.params = params;
        const listener = this.checkSize.bind(this);
        params.column?.addEventListener('widthChanged', listener);
        this.addDestroyFunc(() => {
            params.column?.removeEventListener('widthChanged', listener);
        });
        this.refresh(params);
    }

    public refresh(params: ICellRendererParams): boolean {
        const { node, column, valueFormatted, value } = params;
        const displayValue = valueFormatted ?? value ?? '';
        const eGui = this.getGui();
        _clearElement(eGui);
        const parts = column ? this.beans.find?.getParts({ value: displayValue, node, column }) : undefined;
        this.parts = parts;
        if (!parts) {
            eGui.textContent = _escapeString(displayValue, true) ?? '';
            eGui.classList.remove('ag-find-hidden-match');
            eGui.classList.remove('ag-find-hidden-active-match');
            return true;
        }
        const eHighlights: HTMLElement[] = [];
        for (const { value: partValue, match, activeMatch } of parts) {
            const content = _escapeString(partValue, true) ?? '';
            if (match) {
                const element = document.createElement('mark');
                element.textContent = content;
                element.classList.add('ag-find-match');
                if (activeMatch) {
                    element.classList.add('ag-find-active-match');
                }
                eGui.appendChild(element);
                eHighlights.push(element);
            } else {
                eGui.appendChild(document.createTextNode(content));
            }
        }

        this.checkSize();

        return true;
    }

    private checkSize(): void {
        const eGui = this.getGui();
        const eParentOfValue = this.params.eParentOfValue;
        const { scrollWidth, clientWidth } = eParentOfValue;
        const parts = this.parts;
        if (parts?.length && scrollWidth > clientWidth) {
            setTimeout(() => {
                const availableWidth = _getInnerWidth(eParentOfValue);
                let cumulativeWidth = 0;
                let addHighlight = false;
                let addActiveHighlight = false;
                for (let i = 0; i < eGui.childNodes.length; i++) {
                    const node = eGui.childNodes.item(i);
                    if (cumulativeWidth > availableWidth) {
                        const part = parts[i];
                        if (part) {
                            const { match, activeMatch } = part;
                            addActiveHighlight ||= !!activeMatch;
                            addHighlight ||= !!match;
                            if (activeMatch) {
                                break;
                            }
                        }
                    } else {
                        // only need to keep calculating until overflow
                        const range = document.createRange();
                        range.selectNodeContents(node);
                        const currentWidth = range.getClientRects()[0]?.width ?? 0;
                        cumulativeWidth += currentWidth;
                    }
                }
                eGui.classList.toggle('ag-find-hidden-match', addHighlight && !addActiveHighlight);
                eGui.classList.toggle('ag-find-hidden-active-match', addActiveHighlight);
            });
        } else {
            eGui.classList.remove('ag-find-hidden-match');
            eGui.classList.remove('ag-find-hidden-active-match');
        }
    }
}
