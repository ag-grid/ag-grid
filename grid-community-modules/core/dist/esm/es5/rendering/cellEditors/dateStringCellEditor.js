var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../../context/context";
import { serialiseDate } from "../../utils/date";
import { SimpleCellEditor } from "./simpleCellEditor";
import { exists } from "../../utils/generic";
var DateStringCellEditorInput = /** @class */ (function () {
    function DateStringCellEditorInput(getDataTypeService) {
        this.getDataTypeService = getDataTypeService;
    }
    DateStringCellEditorInput.prototype.getTemplate = function () {
        return /* html */ "<ag-input-date-field class=\"ag-cell-editor\" ref=\"eInput\"></ag-input-date-field>";
    };
    DateStringCellEditorInput.prototype.init = function (eInput, params) {
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
    };
    DateStringCellEditorInput.prototype.getValue = function () {
        var value = this.formatDate(this.eInput.getDate());
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value !== null && value !== void 0 ? value : '');
    };
    DateStringCellEditorInput.prototype.getStartValue = function () {
        var _a, _b;
        return serialiseDate((_b = this.parseDate((_a = this.params.value) !== null && _a !== void 0 ? _a : undefined)) !== null && _b !== void 0 ? _b : null, false);
    };
    DateStringCellEditorInput.prototype.parseDate = function (value) {
        return this.getDataTypeService().getDateParserFunction()(value);
    };
    DateStringCellEditorInput.prototype.formatDate = function (value) {
        return this.getDataTypeService().getDateFormatterFunction()(value);
    };
    return DateStringCellEditorInput;
}());
var DateStringCellEditor = /** @class */ (function (_super) {
    __extends(DateStringCellEditor, _super);
    function DateStringCellEditor() {
        var _this = _super.call(this, new DateStringCellEditorInput(function () { return _this.dataTypeService; })) || this;
        return _this;
    }
    __decorate([
        Autowired('dataTypeService')
    ], DateStringCellEditor.prototype, "dataTypeService", void 0);
    return DateStringCellEditor;
}(SimpleCellEditor));
export { DateStringCellEditor };
