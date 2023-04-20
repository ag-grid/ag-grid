import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { AgCheckbox } from "../../widgets/agCheckbox";
import { stopPropagationForAgGrid } from "../../utils/event";
import { CellEditingStartedEvent, CellEditingStoppedEvent, Events } from "../../events";
import { WithoutGridCommon } from "../../interfaces/iCommon";

export class CheckboxCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE = /* html*/`
        <div class="ag-cell-wrapper" role="presentation">
            <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
        </div>`;

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;
    private params: ICellRendererParams<any, boolean>;

    constructor() {
        super(CheckboxCellRenderer.TEMPLATE);
    }

    public init(params: ICellRendererParams<any, boolean>): void {
        this.params = params;
        this.updateCheckbox(params);

        this.addManagedListener(this.eCheckbox.getInputElement(), 'click', (event) => {
            stopPropagationForAgGrid(event);

            if (this.eCheckbox.isDisabled()) {
                return;
            }

            const isSelected = this.eCheckbox.getValue();

            this.onCheckboxChanged(isSelected)
        });

        this.addManagedListener(this.eCheckbox.getInputElement(), 'dblclick', (event) => {
            stopPropagationForAgGrid(event);
        });
    }

    public refresh(params: ICellRendererParams<any, boolean>): boolean {
        this.params = params;
        this.updateCheckbox(params);
        return true;
    }

    private updateCheckbox(params: ICellRendererParams<any, boolean>): void {
        let isSelected: boolean | undefined;
        if (params.node.group) {
            isSelected = params.value == null || (params.value as any) === '' ? undefined : (params.value as any) === 'true';
        } else {
            isSelected = params.value ?? undefined;
        }
        this.eCheckbox.setValue(isSelected);
        this.eCheckbox.setDisabled(!params.column?.isCellEditable(params.node));
    }

    private onCheckboxChanged(isSelected?: boolean): void {
        const { column, node, rowIndex, pinned: rowPinned, value } = this.params;
        const eventStarted: WithoutGridCommon<CellEditingStartedEvent> = {
            type: Events.EVENT_CELL_EDITING_STARTED,
            column: column!,
            colDef: column?.getColDef()!,
            data: node.data,
            node,
            rowIndex,
            rowPinned: node.rowPinned,
            value
        };
        this.eventService.dispatchEvent(eventStarted);

        const valueChanged = this.params.node.setDataValue(this.params.column!, isSelected, 'edit');

        const eventStopped: WithoutGridCommon<CellEditingStoppedEvent> = {
            type: Events.EVENT_CELL_EDITING_STOPPED,
            column: column!,
            colDef: column?.getColDef()!,
            data: node.data,
            node,
            rowIndex,
            rowPinned: node.rowPinned,
            value,
            oldValue: value,
            newValue: isSelected,
            valueChanged
        };
        this.eventService.dispatchEvent(eventStopped);
    }
}
