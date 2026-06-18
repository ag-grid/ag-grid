import { _isHorizontalScrollShowing } from 'ag-stack';

import type { ElementParams, ITooltipCtrl, TooltipFeature } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { ColumnSuggestion } from './calculatedColumnFormTypes';

// chevron between group-path segments. U+203A is bidi-mirrored,
// so it flips automatically under `direction: rtl`.
const PATH_SEPARATOR = '›';

const CalculatedColumnAutocompleteRowElement: ElementParams = {
    tag: 'div',
    cls: 'ag-autocomplete-row ag-calculated-column-suggestion',
    role: 'presentation',
    children: [{ tag: 'div', cls: 'ag-autocomplete-row-label ag-calculated-column-suggestion-label' }],
};

export class CalculatedColumnAutocompleteRow extends Component {
    private suggestion!: ColumnSuggestion;
    private tooltipValue: string | null = null;
    private tooltipFeature?: TooltipFeature;

    constructor() {
        super(CalculatedColumnAutocompleteRowElement);
    }

    public postConstruct(): void {
        // Mirrors AgListItem: a tooltip that only shows when the row text is truncated.
        this.tooltipFeature = this.createOptionalManagedBean(
            this.beans.registry.createDynamicBean<TooltipFeature>(
                'highlightTooltipFeature',
                false,
                {
                    getGui: () => this.getGui(),
                    getTooltipValue: () => this.tooltipValue,
                    getLocation: () => 'UNKNOWN',
                    shouldDisplayTooltip: () => this.isTruncated(),
                } as ITooltipCtrl,
                this
            )
        );
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

        const displayPath = suggestion.displayPath;
        if (suggestion.type !== 'column' || !displayPath || displayPath.length < 2) {
            label.textContent = suggestion.label;
            this.tooltipValue = suggestion.label;
            this.tooltipFeature?.setTooltipAndRefresh(this.tooltipValue);
            return;
        }

        label.classList.add('ag-calculated-column-suggestion-path');
        const accessibleLabel = displayPath.join(` ${PATH_SEPARATOR} `);
        gui.setAttribute('aria-label', accessibleLabel);
        this.tooltipValue = accessibleLabel;

        const doc = gui.ownerDocument;
        const leafIndex = displayPath.length - 1;
        for (let i = 0, len = displayPath.length; i < len; ++i) {
            const isLeaf = i === leafIndex;
            const segment = doc.createElement('span');
            segment.className = isLeaf
                ? 'ag-calculated-column-suggestion-leaf'
                : 'ag-calculated-column-suggestion-parent';
            segment.textContent = displayPath[i];
            label.appendChild(segment);

            if (!isLeaf) {
                const separator = doc.createElement('span');
                separator.className = 'ag-calculated-column-suggestion-separator';
                separator.textContent = PATH_SEPARATOR;
                label.appendChild(separator);
            }
        }
        this.tooltipFeature?.setTooltipAndRefresh(this.tooltipValue);
    }

    private isTruncated(): boolean {
        const label = this.getGui().lastElementChild as HTMLElement;
        if (_isHorizontalScrollShowing(label)) {
            return true;
        }
        const segments = label.children;
        for (const segment of segments) {
            if (_isHorizontalScrollShowing(segment as HTMLElement)) {
                return true;
            }
        }
        return false;
    }
}
