var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../../context/context.mjs";
import { serialiseDate } from "../../utils/date.mjs";
import { SimpleCellEditor } from "./simpleCellEditor.mjs";
import { exists } from "../../utils/generic.mjs";
class DateStringCellEditorInput {
    constructor(getDataTypeService) {
        this.getDataTypeService = getDataTypeService;
    }
    getTemplate() {
        return /* html */ `<ag-input-date-field class="ag-cell-editor" ref="eInput"></ag-input-date-field>`;
    }
    init(eInput, params) {
        this.eInput = eInput;
        this.params = params;
        if (params.min != null) {
            eInput.setMin(params.min);
        }
        if (params.max != null) {
            eInput.setMax(params.max);
        }
        if (params.step != null) {
            eInput.setStep(params.step);
        }
    }
    getValue() {
        const value = this.formatDate(this.eInput.getDate());
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value !== null && value !== void 0 ? value : '');
    }
    getStartValue() {
        var _a, _b;
        return serialiseDate((_b = this.parseDate((_a = this.params.value) !== null && _a !== void 0 ? _a : undefined)) !== null && _b !== void 0 ? _b : null, false);
    }
    parseDate(value) {
        return this.getDataTypeService().getDateParserFunction()(value);
    }
    formatDate(value) {
        return this.getDataTypeService().getDateFormatterFunction()(value);
    }
}
export class DateStringCellEditor extends SimpleCellEditor {
    constructor() {
        super(new DateStringCellEditorInput(() => this.dataTypeService));
    }
}
__decorate([
    Autowired('dataTypeService')
], DateStringCellEditor.prototype, "dataTypeService", void 0);
