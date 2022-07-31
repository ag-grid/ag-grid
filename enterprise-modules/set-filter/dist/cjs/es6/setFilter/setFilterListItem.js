"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class SetFilterListItem extends core_1.Component {
    constructor(value, params, translate, isSelected) {
        super(SetFilterListItem.TEMPLATE);
        this.value = value;
        this.params = params;
        this.translate = translate;
        this.isSelected = isSelected;
    }
    init() {
        this.render();
        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange(value => {
            const parsedValue = value || false;
            this.isSelected = parsedValue;
            const event = {
                type: SetFilterListItem.EVENT_SELECTION_CHANGED,
                isSelected: parsedValue,
            };
            this.dispatchEvent(event);
        });
    }
    toggleSelected() {
        if (!!this.params.readOnly) {
            return;
        }
        this.isSelected = !this.isSelected;
        this.eCheckbox.setValue(this.isSelected);
    }
    render() {
        const { params: { column } } = this;
        let { value } = this;
        let formattedValue = null;
        if (typeof value === 'function') {
            value = value();
        }
        else {
            formattedValue = this.getFormattedValue(this.params, column, value);
        }
        if (this.params.showTooltips) {
            const tooltipValue = formattedValue != null ? formattedValue : value;
            this.setTooltip(tooltipValue);
        }
        const params = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            colDef: this.params.colDef,
            column: this.params.column,
        };
        this.renderCell(params);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        return res;
    }
    getFormattedValue(filterParams, column, value) {
        const formatter = filterParams && filterParams.valueFormatter;
        return this.valueFormatterService.formatValue(column, null, value, formatter, false);
    }
    renderCell(params) {
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, params);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            const valueToRender = params.valueFormatted == null ? params.value : params.valueFormatted;
            this.eCheckbox.setLabel(valueToRender == null ? this.translate('blanks') : valueToRender);
            return;
        }
        cellRendererPromise.then(component => {
            if (component) {
                this.eCheckbox.setLabel(component.getGui());
                this.addDestroyFunc(() => this.destroyBean(component));
            }
        });
    }
    getComponentHolder() {
        return this.params.column.getColDef();
    }
}
SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
SetFilterListItem.TEMPLATE = `
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;
__decorate([
    core_1.Autowired('valueFormatterService')
], SetFilterListItem.prototype, "valueFormatterService", void 0);
__decorate([
    core_1.Autowired('userComponentFactory')
], SetFilterListItem.prototype, "userComponentFactory", void 0);
__decorate([
    core_1.RefSelector('eCheckbox')
], SetFilterListItem.prototype, "eCheckbox", void 0);
__decorate([
    core_1.PostConstruct
], SetFilterListItem.prototype, "init", null);
exports.SetFilterListItem = SetFilterListItem;
