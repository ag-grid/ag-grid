import type { UserCompDetails } from 'ag-grid-community';
import { _createElement } from 'ag-grid-community';

import { AgAutocompleteRow } from '../autocomplete/agAutocompleteRow';
import { SET_TREE_SEPARATOR } from './setOperandsParser';

const PATH_SEPARATOR = ` ${SET_TREE_SEPARATOR} `;

/**
 * Draws back the first `length` characters of the label, whatever nodes the match highlighting left
 * there: a searched path names its leaf, and the groups above it are context for reading that name.
 */
const deEmphasisePrefix = (label: HTMLElement, length: number): void => {
    const ePrefix = _createElement({ tag: 'span', cls: 'ag-autocomplete-row-path-parent' });
    let remaining = length;
    while (remaining > 0 && label.firstChild) {
        const node = label.firstChild;
        const text = node.textContent ?? '';
        if (text.length <= remaining) {
            remaining -= text.length;
            ePrefix.appendChild(node);
            continue;
        }
        // The node straddles the split, so it is divided rather than moved whole.
        const head = node.cloneNode(false);
        head.textContent = text.slice(0, remaining);
        node.textContent = text.slice(remaining);
        ePrefix.appendChild(head);
        remaining = 0;
    }
    label.prepend(ePrefix);
};

/** A Set Filter value in the autocomplete: the column's own cell renderer, and a group's child count. */
export class AgSetValueAutocompleteRow extends AgAutocompleteRow {
    /** Decided when the row renders, not when the renderer arrives: a framework one lands a tick later. */
    private rendererOwnsLabel = false;

    constructor(
        value: string,
        private readonly childCount: number | undefined,
        private readonly createCellRenderer: (() => UserCompDetails | undefined) | undefined
    ) {
        super();
        this.value = value;
    }

    public postConstruct(): void {
        this.render();
    }

    public override setSearchString(searchString: string): void {
        // A cell renderer owns its own content, so the match is not marked up inside it.
        if (!this.rendererOwnsLabel) {
            super.setSearchString(searchString);
        }
    }

    protected override render(): void {
        const compDetails = this.createCellRenderer?.();
        if (!compDetails) {
            super.render();
            return;
        }
        const eLabel = this.getLabel();
        eLabel.textContent = '';
        this.rendererOwnsLabel = true;
        compDetails.newAgStackInstance().then((comp) => {
            if (!this.isAlive()) {
                this.destroyBean(comp);
                return;
            }
            this.addDestroyFunc(() => this.destroyBean(comp));
            eLabel.appendChild(comp.getGui());
            this.afterLabelRendered();
        });
    }

    protected override afterLabelRendered(): void {
        const value = this.value;
        // Only a searched match displays a path; a renderer owns its own content, so it is left alone.
        const separator = this.rendererOwnsLabel ? -1 : (value?.lastIndexOf(PATH_SEPARATOR) ?? -1);
        if (separator >= 0) {
            deEmphasisePrefix(this.getLabel(), separator + PATH_SEPARATOR.length);
        }
        const childCount = this.childCount;
        if (childCount == null) {
            return;
        }
        this.getLabel().appendChild(
            _createElement({
                tag: 'span',
                cls: 'ag-autocomplete-row-group-count',
                children: ` [${childCount}]`,
            })
        );
    }
}
