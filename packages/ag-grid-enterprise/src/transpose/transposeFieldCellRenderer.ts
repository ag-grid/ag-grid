import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, ICellRendererComp, ICellRendererParams, RowNode } from 'ag-grid-community';
import { Component, _createIconNoSpan } from 'ag-grid-community';

import type { TransposeService } from './transposeService';

const INDENT_PX = 16;

const TransposeFieldCellElement: ElementParams = {
    tag: 'span',
    cls: 'ag-transpose-field',
    children: [
        { tag: 'span', ref: 'eExpand', cls: 'ag-transpose-field-expand' },
        { tag: 'span', ref: 'eLabel', cls: 'ag-transpose-field-label' },
    ],
};

export class TransposeFieldCellRenderer extends Component implements ICellRendererComp {
    private readonly eExpand: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private rowNode: RowNode | null = null;

    constructor() {
        super(TransposeFieldCellElement);
    }

    public init(params: ICellRendererParams): void {
        this.addManagedElementListeners(this.eExpand, { click: () => this.toggle() });
        this.render(params);
    }

    public refresh(params: ICellRendererParams): boolean {
        this.render(params);
        return true;
    }

    private render(params: ICellRendererParams): void {
        const rowNode = params.node as RowNode;
        this.rowNode = rowNode;
        const transposeSvc = this.beans.transposeSvc as TransposeService;
        const isGroup = transposeSvc.isFieldGroupRow(rowNode);

        this.getGui().style.paddingInlineStart = `${(rowNode.uiLevel ?? 0) * INDENT_PX}px`;
        this.toggleCss('ag-transpose-field-group', isGroup);
        this.eLabel.textContent = params.value ?? '';

        const eExpand = this.eExpand;
        eExpand.replaceChildren();
        if (isGroup && transposeSvc.isFieldGroupExpandable(rowNode)) {
            const icon = _createIconNoSpan(
                transposeSvc.isFieldGroupExpanded(rowNode) ? 'groupExpanded' : 'groupContracted',
                this.beans
            );
            if (icon) {
                eExpand.appendChild(icon);
            }
        }
    }

    private toggle(): void {
        const rowNode = this.rowNode;
        if (rowNode) {
            (this.beans.transposeSvc as TransposeService).toggleFieldGroup(rowNode);
        }
    }
}
