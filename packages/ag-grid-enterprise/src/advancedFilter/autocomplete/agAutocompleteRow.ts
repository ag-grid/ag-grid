import type { ElementParams } from 'ag-grid-community';
import { Component, _clearElement, _createElement, _exists } from 'ag-grid-community';

const AgAutocompleteRowElement: ElementParams = {
    tag: 'div',
    cls: 'ag-autocomplete-row',
    role: 'presentation',
    children: [{ tag: 'div', cls: 'ag-autocomplete-row-label' }],
};

export class AgAutocompleteRow extends Component {
    private value: string | undefined;
    private hasHighlighting = false;

    constructor() {
        super(AgAutocompleteRowElement);
    }

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

                const child = this.getGui().lastElementChild! as HTMLElement;
                _clearElement(child);
                child.append(
                    // Start part
                    value.slice(0, index),
                    // Highlighted part wrapped in bold tag
                    _createElement({ tag: 'b', children: value.slice(index, highlightEndIndex) }),
                    // End part
                    value.slice(highlightEndIndex)
                );
            }
        }
        if (!keepHighlighting && this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    }

    private render() {
        // putting in blank if missing, so at least the user can click on it
        this.getGui().lastElementChild!.textContent = this.value ?? '\u00A0';
    }
}
