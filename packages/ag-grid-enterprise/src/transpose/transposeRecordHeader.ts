import { RefPlaceholder } from 'ag-stack';

import type { AgColumn, ElementParams, IHeaderComp, IHeaderParams } from 'ag-grid-community';
import { Component, _isRowSelection } from 'ag-grid-community';

const TransposeRecordHeaderElement: ElementParams = {
    tag: 'div',
    cls: 'ag-transpose-record-header',
    children: [
        {
            tag: 'input',
            ref: 'eCheckbox',
            cls: 'ag-transpose-record-checkbox',
            attrs: { type: 'checkbox', 'aria-label': 'Select record' },
        },
        { tag: 'span', ref: 'eLabel', cls: 'ag-header-cell-text' },
    ],
};

/** Record column header; selects the record it shows, so selection stays on the real row node. */
export class TransposeRecordHeader extends Component implements IHeaderComp {
    private readonly eCheckbox: HTMLInputElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private column: AgColumn | null = null;

    constructor() {
        super(TransposeRecordHeaderElement);
    }

    public init(params: IHeaderParams): void {
        this.addManagedElementListeners(this.eCheckbox, { change: () => this.onCheckboxChanged() });
        this.addManagedEventListeners({ selectionChanged: () => this.refreshSelection() });
        this.refresh(params);
    }

    public refresh(params: IHeaderParams): boolean {
        this.column = params.column as AgColumn;
        this.eLabel.textContent = params.displayName;
        this.eCheckbox.hidden = !_isRowSelection(this.gos);
        this.refreshSelection();
        return true;
    }

    private refreshSelection(): void {
        const selected = !!this.column?.transposeRecord?.isSelected();
        this.eCheckbox.checked = selected;
        this.toggleCss('ag-transpose-record-header-selected', selected);
    }

    private onCheckboxChanged(): void {
        this.column?.transposeRecord?.setSelected(this.eCheckbox.checked, false, 'checkboxSelected');
    }
}
