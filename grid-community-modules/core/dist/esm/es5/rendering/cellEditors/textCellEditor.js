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
import { SimpleCellEditor } from "./simpleCellEditor";
import { exists } from "../../utils/generic";
var TextCellEditorInput = /** @class */ (function () {
    function TextCellEditorInput() {
    }
    TextCellEditorInput.prototype.getTemplate = function () {
        return /* html */ "<ag-input-text-field class=\"ag-cell-editor\" ref=\"eInput\"></ag-input-text-field>";
    };
    TextCellEditorInput.prototype.init = function (eInput, params) {
        this.eInput = eInput;
        this.params = params;
        if (params.maxLength != null) {
            eInput.setMaxLength(params.maxLength);
        }
    };
    TextCellEditorInput.prototype.getValue = function () {
        var value = this.eInput.getValue();
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value);
    };
    TextCellEditorInput.prototype.getStartValue = function () {
        var formatValue = this.params.useFormatter || this.params.column.getColDef().refData;
        return formatValue ? this.params.formatValue(this.params.value) : this.params.value;
    };
    TextCellEditorInput.prototype.setCaret = function () {
        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        var value = this.eInput.getValue();
        var len = (exists(value) && value.length) || 0;
        if (len) {
            this.eInput.getInputElement().setSelectionRange(len, len);
        }
    };
    return TextCellEditorInput;
}());
var TextCellEditor = /** @class */ (function (_super) {
    __extends(TextCellEditor, _super);
    function TextCellEditor() {
        return _super.call(this, new TextCellEditorInput()) || this;
    }
    return TextCellEditor;
}(SimpleCellEditor));
export { TextCellEditor };
