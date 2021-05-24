/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var UndoRedoAction = /** @class */ (function () {
    function UndoRedoAction(cellValueChanges) {
        this.cellValueChanges = cellValueChanges;
    }
    return UndoRedoAction;
}());
exports.UndoRedoAction = UndoRedoAction;
var FillUndoRedoAction = /** @class */ (function (_super) {
    __extends(FillUndoRedoAction, _super);
    function FillUndoRedoAction(cellValueChanges, initialRange, finalRange) {
        var _this = _super.call(this, cellValueChanges) || this;
        _this.initialRange = initialRange;
        _this.finalRange = finalRange;
        return _this;
    }
    return FillUndoRedoAction;
}(UndoRedoAction));
exports.FillUndoRedoAction = FillUndoRedoAction;
var UndoRedoStack = /** @class */ (function () {
    function UndoRedoStack(maxStackSize) {
        this.actionStack = [];
        this.maxStackSize = maxStackSize ? maxStackSize : UndoRedoStack.DEFAULT_STACK_SIZE;
        this.actionStack = new Array(this.maxStackSize);
    }
    UndoRedoStack.prototype.pop = function () {
        return this.actionStack.pop();
    };
    UndoRedoStack.prototype.push = function (item) {
        var shouldAddActions = item.cellValueChanges && item.cellValueChanges.length > 0;
        if (!shouldAddActions) {
            return;
        }
        if (this.actionStack.length === this.maxStackSize) {
            this.actionStack.shift();
        }
        this.actionStack.push(item);
    };
    UndoRedoStack.prototype.clear = function () {
        this.actionStack = [];
    };
    UndoRedoStack.prototype.getCurrentStackSize = function () {
        return this.actionStack.length;
    };
    UndoRedoStack.DEFAULT_STACK_SIZE = 10;
    return UndoRedoStack;
}());
exports.UndoRedoStack = UndoRedoStack;

//# sourceMappingURL=undoRedoStack.js.map
