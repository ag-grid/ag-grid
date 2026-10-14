import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, IHeaderComp, IHeaderParams } from 'ag-grid-community';
import { Component, _getRowSelectionMode } from 'ag-grid-community';

const TransposeFieldHeaderElement: ElementParams = {
    tag: 'div',
    cls: 'ag-transpose-record-header',
    children: [
        {
            tag: 'input',
            ref: 'eCheckbox',
            cls: 'ag-transpose-record-checkbox',
            attrs: { type: 'checkbox', 'aria-label': 'Select all records' },
        },
        { tag: 'span', ref: 'eLabel', cls: 'ag-header-cell-text' },
    ],
};

/** Field-name column header: selects or deselects every record that passes the filters. */
export class TransposeFieldHeader extends Component implements IHeaderComp {
    private readonly eCheckbox: HTMLInputElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;

    constructor() {
        super(TransposeFieldHeaderElement);
    }

    public init(params: IHeaderParams): void {
        this.addManagedElementListeners(this.eCheckbox, { change: () => this.onCheckboxChanged() });
        this.addManagedEventListeners({
            selectionChanged: () => this.refreshSelection(),
            modelUpdated: () => this.refreshSelection(),
        });
        this.refresh(params);
    }

    public refresh(params: IHeaderParams): boolean {
        this.eLabel.textContent = params.displayName;
        this.eCheckbox.hidden = _getRowSelectionMode(this.gos) !== 'multiRow';
        this.refreshSelection();
        return true;
    }

    private refreshSelection(): void {
        const state = this.beans.selectionSvc?.getSelectAllState('filtered');
        const eCheckbox = this.eCheckbox;
        eCheckbox.checked = state === true;
        eCheckbox.indeterminate = state === null;
    }

    private onCheckboxChanged(): void {
        const selectionSvc = this.beans.selectionSvc;
        if (!selectionSvc) {
            return;
        }
        const params = { source: 'uiSelectAllFiltered', selectAll: 'filtered' } as const;
        if (selectionSvc.getSelectAllState('filtered') === true) {
            selectionSvc.deselectAllRowNodes(params);
        } else {
            selectionSvc.selectAllRowNodes(params);
        }
    }
}
