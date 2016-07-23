/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.3
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
var context_1 = require("../context/context");
var utils_1 = require('../utils');
var gridCore_1 = require("../gridCore");
var columnController_1 = require("../columnController/columnController");
var constants_1 = require("../constants");
var gridCell_1 = require("../entities/gridCell");
// tracks when focus goes into a cell. cells listen to this, so they know to stop editing
// if focus goes into another cell.
var FocusService = (function () {
    function FocusService() {
        this.destroyMethods = [];
        this.listeners = [];
    }
    FocusService.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    FocusService.prototype.removeListener = function (listener) {
        utils_1.Utils.removeFromArray(this.listeners, listener);
    };
    FocusService.prototype.init = function () {
        var _this = this;
        var focusListener = function (focusEvent) {
            var gridCell = _this.getCellForFocus(focusEvent);
            if (gridCell) {
                _this.informListeners({ gridCell: gridCell });
            }
        };
        var eRootGui = this.gridCore.getRootGui();
        eRootGui.addEventListener('focus', focusListener, true);
        this.destroyMethods.push(function () {
            eRootGui.removeEventListener('focus', focusListener);
        });
    };
    FocusService.prototype.getCellForFocus = function (focusEvent) {
        var column = null;
        var row = null;
        var floating = null;
        var that = this;
        var eTarget = focusEvent.target;
        while (eTarget) {
            checkRow(eTarget);
            checkColumn(eTarget);
            eTarget = eTarget.parentNode;
        }
        if (utils_1.Utils.exists(column) && utils_1.Utils.exists(row)) {
            var gridCell = new gridCell_1.GridCell(row, floating, column);
            return gridCell;
        }
        else {
            return null;
        }
        function checkRow(eTarget) {
            // match the column by checking a) it has a valid colId and b) it has the 'ag-cell' class
            var rowId = utils_1.Utils.getElementAttribute(eTarget, 'row');
            if (utils_1.Utils.exists(rowId) && utils_1.Utils.containsClass(eTarget, 'ag-row')) {
                if (rowId.indexOf('ft') === 0) {
                    floating = constants_1.Constants.FLOATING_TOP;
                    rowId = rowId.substr(3);
                }
                else if (rowId.indexOf('fb') === 0) {
                    floating = constants_1.Constants.FLOATING_BOTTOM;
                    rowId = rowId.substr(3);
                }
                else {
                    floating = null;
                }
                row = parseInt(rowId);
            }
        }
        function checkColumn(eTarget) {
            // match the column by checking a) it has a valid colId and b) it has the 'ag-cell' class
            var colId = utils_1.Utils.getElementAttribute(eTarget, 'colid');
            if (utils_1.Utils.exists(colId) && utils_1.Utils.containsClass(eTarget, 'ag-cell')) {
                var foundColumn = that.columnController.getGridColumn(colId);
                if (foundColumn) {
                    column = foundColumn;
                }
            }
        }
    };
    FocusService.prototype.informListeners = function (event) {
        this.listeners.forEach(function (listener) { return listener(event); });
    };
    FocusService.prototype.destroy = function () {
        this.destroyMethods.forEach(function (destroyMethod) { return destroyMethod(); });
    };
    __decorate([
        context_1.Autowired('gridCore'), 
        __metadata('design:type', gridCore_1.GridCore)
    ], FocusService.prototype, "gridCore", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], FocusService.prototype, "columnController", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], FocusService.prototype, "init", null);
    __decorate([
        context_1.PreDestroy, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], FocusService.prototype, "destroy", null);
    FocusService = __decorate([
        context_1.Bean('focusService'), 
        __metadata('design:paramtypes', [])
    ], FocusService);
    return FocusService;
})();
exports.FocusService = FocusService;
