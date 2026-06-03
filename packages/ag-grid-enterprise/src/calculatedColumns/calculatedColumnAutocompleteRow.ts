import type { ElementParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { ColumnSuggestion } from './calculatedColumnFormTypes';

const CalculatedColumnAutocompleteRowElement: ElementParams = {
    tag: 'div',
    cls: 'ag-autocomplete-row ag-calculated-column-suggestion',
    role: 'presentation',
    children: [{ tag: 'div', cls: 'ag-autocomplete-row-label ag-calculated-column-suggestion-label' }],
};

export class CalculatedColumnAutocompleteRow extends Component {
    private suggestion!: ColumnSuggestion;

    constructor() {
        super(CalculatedColumnAutocompleteRowElement);
    }

    public setState(suggestion: ColumnSuggestion, selected: boolean): void {
        this.suggestion = suggestion;
        this.render();
        this.updateSelected(selected);
    }

    public updateSelected(selected: boolean): void {
        this.toggleCss('ag-autocomplete-row-selected', selected);
    }

    public setSearchString(_searchString: string): void {
        // Column suggestion rows render fixed path segments, so no inline search highlighting is applied.
    }

    private render(): void {
        const suggestion = this.suggestion;
        const gui = this.getGui();
        const label = gui.lastElementChild as HTMLElement;
        label.textContent = '';
        label.classList.remove('ag-calculated-column-suggestion-path');
        gui.removeAttribute('aria-label');
        gui.removeAttribute('title');

        const displayPath = suggestion.displayPath;
        if (suggestion.type !== 'column' || !displayPath || displayPath.length < 2) {
            label.textContent = suggestion.label;
            return;
        }

        label.classList.add('ag-calculated-column-suggestion-path');
        const accessibleLabel = displayPath.join(' > ');
        gui.setAttribute('aria-label', accessibleLabel);
        gui.title = accessibleLabel;

        const doc = gui.ownerDocument;
        const leafIndex = displayPath.length - 1;
        for (let i = 0, len = displayPath.length; i < len; ++i) {
            const isLeaf = i === leafIndex;
            const segment = doc.createElement('span');
            segment.className = isLeaf
                ? 'ag-calculated-column-suggestion-leaf'
                : 'ag-calculated-column-suggestion-parent';
            segment.textContent = displayPath[i];
            segment.title = displayPath[i];
            label.appendChild(segment);

            if (!isLeaf) {
                const separator = doc.createElement('span');
                separator.className = 'ag-calculated-column-suggestion-separator';
                separator.textContent = '>';
                label.appendChild(separator);
            }
        }
    }
}
