/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("../../widgets/component");
var utils_1 = require('../../utils');
var constants_1 = require("../../constants");
var SelectCellEditor = (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        _super.call(this, '<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>');
    }
    SelectCellEditor.prototype.init = function (params) {
        var eSelect = this.getGui().querySelector('select');
        if (utils_1.Utils.missing(params.values)) {
            console.log('ag-Grid: no values found for select cellEditor');
            return;
        }
        params.values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            if (params.value === value) {
                option.selected = true;
            }
            eSelect.appendChild(option);
        });
        this.addDestroyableEventListener(eSelect, 'change', function () { return params.stopEditing(); });
        this.addDestroyableEventListener(eSelect, 'keydown', function (event) {
            var isNavigationKey = event.keyCode === constants_1.Constants.KEY_UP || event.keyCode === constants_1.Constants.KEY_DOWN;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });
        this.addDestroyableEventListener(eSelect, 'mousedown', function (event) {
            event.stopPropagation();
        });
    };
    SelectCellEditor.prototype.afterGuiAttached = function () {
        var eSelect = this.getGui().querySelector('select');
        eSelect.focus();
    };
    SelectCellEditor.prototype.getValue = function () {
        var eSelect = this.getGui().querySelector('select');
        return eSelect.value;
    };
    return SelectCellEditor;
})(component_1.Component);
exports.SelectCellEditor = SelectCellEditor;
