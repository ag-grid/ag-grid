/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("./context/context");
var rowNode_1 = require("./entities/rowNode");
var renderedRow_1 = require("./rendering/renderedRow");
var utils_1 = require('./utils');
var SelectionRendererFactory = (function () {
    function SelectionRendererFactory() {
    }
    SelectionRendererFactory.prototype.createSelectionCheckbox = function (rowNode, rowIndex, addRenderedRowEventListener) {
        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.className = 'ag-selection-checkbox';
        utils_1.Utils.setCheckboxState(eCheckbox, rowNode.isSelected());
        eCheckbox.addEventListener('click', function (event) { return event.stopPropagation(); });
        eCheckbox.addEventListener('change', function () {
            var newValue = eCheckbox.checked;
            if (newValue) {
                rowNode.setSelected(newValue);
            }
            else {
                rowNode.setSelected(newValue);
            }
        });
        var selectionChangedCallback = function () { return utils_1.Utils.setCheckboxState(eCheckbox, rowNode.isSelected()); };
        rowNode.addEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
        addRenderedRowEventListener(renderedRow_1.RenderedRow.EVENT_RENDERED_ROW_REMOVED, function () {
            rowNode.removeEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
        });
        return eCheckbox;
    };
    SelectionRendererFactory = __decorate([
        context_1.Bean('selectionRendererFactory'), 
        __metadata('design:paramtypes', [])
    ], SelectionRendererFactory);
    return SelectionRendererFactory;
})();
exports.SelectionRendererFactory = SelectionRendererFactory;
