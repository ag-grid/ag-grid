import { _clearElement, _exists } from 'ag-stack';

import type { ElementParams } from 'ag-grid-community';
import { Component, _createElement } from 'ag-grid-community';

const AgAutocompleteRowElement: ElementParams = {
    tag: 'div',
    cls: 'ag-autocomplete-row',
    role: 'presentation',
    children: [{ tag: 'div', cls: 'ag-autocomplete-row-label' }],
};

export class AgAutocompleteRow extends Component {
    protected value: string | undefined;
    private hasHighlighting = false;

    constructor() {
        super(AgAutocompleteRowElement);
    }

    protected getLabel(): HTMLElement {
        return this.getGui().lastElementChild as HTMLElement;
    }

    /** Called whenever the label's content is replaced, for a subclass to append to what was written. */
    protected afterLabelRendered(): void {}

    public setState(value: string, selected: boolean): void {
        this.value = value;

        this.render();

        this.updateSelected(selected);
    }

    public updateSelected(selected: boolean): void {
        this.toggleCss('ag-autocomplete-row-selected', selected);
    }

    public setSearchString(searchString: string): void {
        let keepHighlighting = false;
        const { value } = this;
        if (value && _exists(searchString)) {
            const index = value.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase());
            if (index >= 0) {
                keepHighlighting = true;
                this.hasHighlighting = true;
                const highlightEndIndex = index + searchString.length;

                const child = this.getLabel();
                _clearElement(child);
                child.append(
                    // Start part
                    value.slice(0, index),
                    // Highlighted part wrapped in bold tag
                    _createElement({ tag: 'b', children: value.slice(index, highlightEndIndex) }),
                    // End part
                    value.slice(highlightEndIndex)
                );
                this.afterLabelRendered();
            }
        }
        if (!keepHighlighting && this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    }

    protected render() {
        // putting in blank if missing, so at least the user can click on it
        this.getLabel().textContent = this.value ?? '\u00A0';
        this.afterLabelRendered();
    }
}
