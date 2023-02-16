/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoRedoStack = exports.RangeUndoRedoAction = exports.UndoRedoAction = void 0;
class UndoRedoAction {
    constructor(cellValueChanges) {
        this.cellValueChanges = cellValueChanges;
    }
}
exports.UndoRedoAction = UndoRedoAction;
class RangeUndoRedoAction extends UndoRedoAction {
    constructor(cellValueChanges, initialRange, finalRange, ranges) {
        super(cellValueChanges);
        this.initialRange = initialRange;
        this.finalRange = finalRange;
        this.ranges = ranges;
    }
}
exports.RangeUndoRedoAction = RangeUndoRedoAction;
class UndoRedoStack {
    constructor(maxStackSize) {
        this.actionStack = [];
        this.maxStackSize = maxStackSize ? maxStackSize : UndoRedoStack.DEFAULT_STACK_SIZE;
        this.actionStack = new Array(this.maxStackSize);
    }
    pop() {
        return this.actionStack.pop();
    }
    push(item) {
        const shouldAddActions = item.cellValueChanges && item.cellValueChanges.length > 0;
        if (!shouldAddActions) {
            return;
        }
        if (this.actionStack.length === this.maxStackSize) {
            this.actionStack.shift();
        }
        this.actionStack.push(item);
    }
    clear() {
        this.actionStack = [];
    }
    getCurrentStackSize() {
        return this.actionStack.length;
    }
}
exports.UndoRedoStack = UndoRedoStack;
UndoRedoStack.DEFAULT_STACK_SIZE = 10;
