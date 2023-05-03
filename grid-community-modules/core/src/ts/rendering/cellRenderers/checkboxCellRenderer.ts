import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { AgCheckbox } from "../../widgets/agCheckbox";
import { stopPropagationForAgGrid } from "../../utils/event";
import { CellEditingStartedEvent, CellEditingStoppedEvent, Events } from "../../events";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { KeyCode } from "../../constants/keyCode";
import { getAriaCheckboxStateName } from "../../utils/aria";

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
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');

        this.addManagedListener(this.eCheckbox.getInputElement(), 'click', (event: Event) => {
            stopPropagationForAgGrid(event);

            if (this.eCheckbox.isDisabled()) {
                return;
            }
    
            const isSelected = this.eCheckbox.getValue();
    
            this.onCheckboxChanged(isSelected)
        });

        this.addManagedListener(this.eCheckbox.getInputElement(), 'dblclick', (event: Event) => {
            stopPropagationForAgGrid(event);
        });

        const eDocument = this.gridOptionsService.getDocument();
        this.addManagedListener(this.params.eGridCell, 'keydown', (event: KeyboardEvent) => {
            if (event.key === KeyCode.SPACE && !this.eCheckbox.isDisabled()) {
                if (this.params.eGridCell === eDocument.activeElement) {
                    this.eCheckbox.toggle();
                }
                const isSelected = this.eCheckbox.getValue();
                this.onCheckboxChanged(isSelected)
            }
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
        const disabled = !params.column?.isCellEditable(params.node);
        this.eCheckbox.setDisabled(disabled);

        const translate = this.localeService.getLocaleTextFunc();
        const stateName = getAriaCheckboxStateName(translate, isSelected);
        const ariaLabel = disabled
            ? stateName
            : `${translate('ariaToggleCellValue', 'Press SPACE to toggle cell value')} (${stateName})`;
        this.eCheckbox.setInputAriaLabel(ariaLabel);
    }

    private onCheckboxChanged(isSelected?: boolean): void {
        const { column, node, rowIndex, value } = this.params;
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
