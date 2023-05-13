/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnUtils = void 0;
const columnGroup_1 = require("../entities/columnGroup");
const providedColumnGroup_1 = require("../entities/providedColumnGroup");
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
// takes in a list of columns, as specified by the column definitions, and returns column groups
let ColumnUtils = class ColumnUtils extends beanStub_1.BeanStub {
    calculateColMinWidth(colDef) {
        return colDef.minWidth != null ? colDef.minWidth : this.environment.getMinColWidth();
    }
    calculateColMaxWidth(colDef) {
        return colDef.maxWidth != null ? colDef.maxWidth : Number.MAX_SAFE_INTEGER;
    }
    calculateColInitialWidth(colDef) {
        const minColWidth = this.calculateColMinWidth(colDef);
        const maxColWidth = this.calculateColMaxWidth(colDef);
        let width;
        const colDefWidth = generic_1.attrToNumber(colDef.width);
        const colDefInitialWidth = generic_1.attrToNumber(colDef.initialWidth);
        if (colDefWidth != null) {
            width = colDefWidth;
        }
        else if (colDefInitialWidth != null) {
            width = colDefInitialWidth;
        }
        else {
            width = 200;
        }
        return Math.max(Math.min(width, maxColWidth), minColWidth);
    }
    getOriginalPathForColumn(column, originalBalancedTree) {
        const result = [];
        let found = false;
        const recursePath = (balancedColumnTree, dept) => {
            for (let i = 0; i < balancedColumnTree.length; i++) {
                if (found) {
                    return;
                }
                // quit the search, so 'result' is kept with the found result
                const node = balancedColumnTree[i];
                if (node instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                    const nextNode = node;
                    recursePath(nextNode.getChildren(), dept + 1);
                    result[dept] = node;
                }
                else if (node === column) {
                    found = true;
                }
            }
        };
        recursePath(originalBalancedTree, 0);
        // we should always find the path, but in case there is a bug somewhere, returning null
        // will make it fail rather than provide a 'hard to track down' bug
        return found ? result : null;
    }
    depthFirstOriginalTreeSearch(parent, tree, callback) {
        if (!tree) {
            return;
        }
        tree.forEach((child) => {
            if (child instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                this.depthFirstOriginalTreeSearch(child, child.getChildren(), callback);
            }
            callback(child, parent);
        });
    }
    depthFirstAllColumnTreeSearch(tree, callback) {
        if (!tree) {
            return;
        }
        tree.forEach((child) => {
            if (child instanceof columnGroup_1.ColumnGroup) {
                this.depthFirstAllColumnTreeSearch(child.getChildren(), callback);
            }
            callback(child);
        });
    }
    depthFirstDisplayedColumnTreeSearch(tree, callback) {
        if (!tree) {
            return;
        }
        tree.forEach((child) => {
            if (child instanceof columnGroup_1.ColumnGroup) {
                this.depthFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
            }
            callback(child);
        });
    }
};
ColumnUtils = __decorate([
    context_1.Bean('columnUtils')
], ColumnUtils);
exports.ColumnUtils = ColumnUtils;
