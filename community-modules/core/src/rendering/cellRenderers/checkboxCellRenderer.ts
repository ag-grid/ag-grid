import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { AgCheckbox } from "../../widgets/agCheckbox";
import { stopPropagationForAgGrid } from "../../utils/event";
import { CellEditingStartedEvent, CellEditingStoppedEvent, Events } from "../../events";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { KeyCode } from "../../constants/keyCode";
import { getAriaCheckboxStateName, setAriaLive } from "../../utils/aria";
import { GROUP_AUTO_COLUMN_ID } from "../../columns/autoGroupColService";

export interface ICheckboxCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, boolean, TContext> {
    /** Set to `true` for the input to be disabled. */
    disabled?: boolean;
}

export class CheckboxCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE = /* html*/`
        <div class="ag-cell-wrapper ag-checkbox-cell" role="presentation">
            <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
        </div>`;

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;
    private params: ICheckboxCellRendererParams;

    constructor() {
        super(CheckboxCellRenderer.TEMPLATE);
    }

    public init(params: ICheckboxCellRendererParams): void {
        this.params = params;
        this.updateCheckbox(params);
        const inputEl = this.eCheckbox.getInputElement();
        inputEl.setAttribute('tabindex', '-1');
        setAriaLive(inputEl, 'polite');

        this.addManagedListener(inputEl, 'click', (event: Event) => {
            stopPropagationForAgGrid(event);

            if (this.eCheckbox.isDisabled()) {
                return;
            }
    
            const isSelected = this.eCheckbox.getValue();
    
            this.onCheckboxChanged(isSelected)
        });

        this.addManagedListener(inputEl, 'dblclick', (event: Event) => {
            stopPropagationForAgGrid(event);
        });

        this.addManagedListener(this.params.eGridCell, 'keydown', (event: KeyboardEvent) => {
            if (event.key === KeyCode.SPACE && !this.eCheckbox.isDisabled()) {
                if (this.params.eGridCell === this.gos.getActiveDomElement()) {
                    this.eCheckbox.toggle();
                }
                const isSelected = this.eCheckbox.getValue();
                this.onCheckboxChanged(isSelected);
                event.preventDefault();
            }
        });
    }

    public refresh(params: ICheckboxCellRendererParams): boolean {
        this.params = params;
        this.updateCheckbox(params);
        return true;
    }

    private updateCheckbox(params: ICheckboxCellRendererParams): void {
        let isSelected: boolean | undefined;
        let displayed = true;
        if (params.node.group && params.column) {
            const colId = params.column.getColId();
            if (colId.startsWith(GROUP_AUTO_COLUMN_ID)) {
                // if we're grouping by this column then the value is a string and we need to parse it
                isSelected = params.value == null || (params.value as any) === '' ? undefined : (params.value as any) === 'true';
            } else if (params.node.aggData && params.node.aggData[colId] !== undefined) {
                isSelected = params.value ?? undefined;
            } else {
                displayed = false;
            }
        } else {
            isSelected = params.value ?? undefined;
        }
        if (!displayed) {
            this.eCheckbox.setDisplayed(false);
            return;
        }
        this.eCheckbox.setValue(isSelected);
        const disabled = params.disabled != null ? params.disabled : !params.column?.isCellEditable(params.node);
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
