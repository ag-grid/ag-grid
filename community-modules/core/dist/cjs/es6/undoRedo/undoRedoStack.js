/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UndoRedoAction {
    constructor(cellValueChanges) {
        this.cellValueChanges = cellValueChanges;
    }
}
exports.UndoRedoAction = UndoRedoAction;
class FillUndoRedoAction extends UndoRedoAction {
    constructor(cellValueChanges, initialRange, finalRange) {
        super(cellValueChanges);
        this.initialRange = initialRange;
        this.finalRange = finalRange;
    }
}
exports.FillUndoRedoAction = FillUndoRedoAction;
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
