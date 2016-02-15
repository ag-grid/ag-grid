/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var grid_1 = require("./grid");
var SelectionRendererFactory = (function () {
    function SelectionRendererFactory() {
    }
    SelectionRendererFactory.prototype.init = function (grid, selectionController) {
        this.grid = grid;
        this.selectionController = selectionController;
    };
    SelectionRendererFactory.prototype.createSelectionCheckbox = function (node, rowIndex) {
        var _this = this;
        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.className = 'ag-selection-checkbox';
        this.setCheckboxState(eCheckbox, this.selectionController.isNodeSelected(node));
        var that = this;
        eCheckbox.onclick = function (event) {
            event.stopPropagation();
        };
        eCheckbox.onchange = function () {
            var newValue = eCheckbox.checked;
            if (newValue) {
                that.selectionController.selectIndex(rowIndex, true);
            }
            else {
                that.selectionController.deselectIndex(rowIndex);
            }
        };
        this.grid.addVirtualRowListener(grid_1.Grid.VIRTUAL_ROW_SELECTED, rowIndex, function (selected) {
            _this.setCheckboxState(eCheckbox, selected);
        });
        return eCheckbox;
    };
    SelectionRendererFactory.prototype.setCheckboxState = function (eCheckbox, state) {
        if (typeof state === 'boolean') {
            eCheckbox.checked = state;
            eCheckbox.indeterminate = false;
        }
        else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            eCheckbox.indeterminate = true;
        }
    };
    return SelectionRendererFactory;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SelectionRendererFactory;
