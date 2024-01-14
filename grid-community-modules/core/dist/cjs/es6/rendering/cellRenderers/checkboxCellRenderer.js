"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxCellRenderer = void 0;
const component_1 = require("../../widgets/component");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const event_1 = require("../../utils/event");
const events_1 = require("../../events");
const keyCode_1 = require("../../constants/keyCode");
const aria_1 = require("../../utils/aria");
const autoGroupColService_1 = require("../../columns/autoGroupColService");
class CheckboxCellRenderer extends component_1.Component {
    constructor() {
        super(CheckboxCellRenderer.TEMPLATE);
    }
    init(params) {
        this.params = params;
        this.updateCheckbox(params);
        const inputEl = this.eCheckbox.getInputElement();
        inputEl.setAttribute('tabindex', '-1');
        (0, aria_1.setAriaLive)(inputEl, 'polite');
        this.addManagedListener(inputEl, 'click', (event) => {
            (0, event_1.stopPropagationForAgGrid)(event);
            if (this.eCheckbox.isDisabled()) {
                return;
            }
            const isSelected = this.eCheckbox.getValue();
            this.onCheckboxChanged(isSelected);
        });
        this.addManagedListener(inputEl, 'dblclick', (event) => {
            (0, event_1.stopPropagationForAgGrid)(event);
        });
        const eDocument = this.gridOptionsService.getDocument();
        this.addManagedListener(this.params.eGridCell, 'keydown', (event) => {
            if (event.key === keyCode_1.KeyCode.SPACE && !this.eCheckbox.isDisabled()) {
                if (this.params.eGridCell === eDocument.activeElement) {
                    this.eCheckbox.toggle();
                }
                const isSelected = this.eCheckbox.getValue();
                this.onCheckboxChanged(isSelected);
                event.preventDefault();
            }
        });
    }
    refresh(params) {
        this.params = params;
        this.updateCheckbox(params);
        return true;
    }
    updateCheckbox(params) {
        var _a, _b, _c;
        let isSelected;
        let displayed = true;
        if (params.node.group && params.column) {
            const colId = params.column.getColId();
            if (colId.startsWith(autoGroupColService_1.GROUP_AUTO_COLUMN_ID)) {
                // if we're grouping by this column then the value is a string and we need to parse it
                isSelected = params.value == null || params.value === '' ? undefined : params.value === 'true';
            }
            else if (params.node.aggData && params.node.aggData[colId] !== undefined) {
                isSelected = (_a = params.value) !== null && _a !== void 0 ? _a : undefined;
            }
            else {
                displayed = false;
            }
        }
        else {
            isSelected = (_b = params.value) !== null && _b !== void 0 ? _b : undefined;
        }
        if (!displayed) {
            this.eCheckbox.setDisplayed(false);
            return;
        }
        this.eCheckbox.setValue(isSelected);
        const disabled = params.disabled != null ? params.disabled : !((_c = params.column) === null || _c === void 0 ? void 0 : _c.isCellEditable(params.node));
        this.eCheckbox.setDisabled(disabled);
        const translate = this.localeService.getLocaleTextFunc();
        const stateName = (0, aria_1.getAriaCheckboxStateName)(translate, isSelected);
        const ariaLabel = disabled
            ? stateName
            : `${translate('ariaToggleCellValue', 'Press SPACE to toggle cell value')} (${stateName})`;
        this.eCheckbox.setInputAriaLabel(ariaLabel);
    }
    onCheckboxChanged(isSelected) {
        const { column, node, rowIndex, value } = this.params;
        const eventStarted = {
            type: events_1.Events.EVENT_CELL_EDITING_STARTED,
            column: column,
            colDef: column === null || column === void 0 ? void 0 : column.getColDef(),
            data: node.data,
            node,
            rowIndex,
            rowPinned: node.rowPinned,
            value
        };
        this.eventService.dispatchEvent(eventStarted);
        const valueChanged = this.params.node.setDataValue(this.params.column, isSelected, 'edit');
        const eventStopped = {
            type: events_1.Events.EVENT_CELL_EDITING_STOPPED,
            column: column,
            colDef: column === null || column === void 0 ? void 0 : column.getColDef(),
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
CheckboxCellRenderer.TEMPLATE = `
        <div class="ag-cell-wrapper ag-checkbox-cell" role="presentation">
            <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
        </div>`;
__decorate([
    (0, componentAnnotations_1.RefSelector)('eCheckbox')
], CheckboxCellRenderer.prototype, "eCheckbox", void 0);
exports.CheckboxCellRenderer = CheckboxCellRenderer;
