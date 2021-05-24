/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ColumnGroup } from "../entities/columnGroup";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { getMaxSafeInteger } from "../utils/number";
import { attrToNumber } from "../utils/generic";
// takes in a list of columns, as specified by the column definitions, and returns column groups
var ColumnUtils = /** @class */ (function (_super) {
    __extends(ColumnUtils, _super);
    function ColumnUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnUtils.prototype.calculateColInitialWidth = function (colDef) {
        var optionsWrapper = this.gridOptionsWrapper;
        var minColWidth = colDef.minWidth != null ? colDef.minWidth : optionsWrapper.getMinColWidth();
        var maxColWidth = colDef.maxWidth != null ? colDef.maxWidth : (optionsWrapper.getMaxColWidth() || getMaxSafeInteger());
        var width;
        var colDefWidth = attrToNumber(colDef.width);
        var colDefInitialWidth = attrToNumber(colDef.initialWidth);
        if (colDefWidth != null) {
            width = colDefWidth;
        }
        else if (colDefInitialWidth != null) {
            width = colDefInitialWidth;
        }
        else {
            width = optionsWrapper.getColWidth();
        }
        return Math.max(Math.min(width, maxColWidth), minColWidth);
    };
    ColumnUtils.prototype.getOriginalPathForColumn = function (column, originalBalancedTree) {
        var result = [];
        var found = false;
        var recursePath = function (balancedColumnTree, dept) {
            for (var i = 0; i < balancedColumnTree.length; i++) {
                if (found) {
                    return;
                }
                // quit the search, so 'result' is kept with the found result
                var node = balancedColumnTree[i];
                if (node instanceof OriginalColumnGroup) {
                    var nextNode = node;
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
    };
    ColumnUtils.prototype.depthFirstOriginalTreeSearch = function (parent, tree, callback) {
        var _this = this;
        if (!tree) {
            return;
        }
        tree.forEach(function (child) {
            if (child instanceof OriginalColumnGroup) {
                _this.depthFirstOriginalTreeSearch(child, child.getChildren(), callback);
            }
            callback(child, parent);
        });
    };
    ColumnUtils.prototype.depthFirstAllColumnTreeSearch = function (tree, callback) {
        var _this = this;
        if (!tree) {
            return;
        }
        tree.forEach(function (child) {
            if (child instanceof ColumnGroup) {
                _this.depthFirstAllColumnTreeSearch(child.getChildren(), callback);
            }
            callback(child);
        });
    };
    ColumnUtils.prototype.depthFirstDisplayedColumnTreeSearch = function (tree, callback) {
        var _this = this;
        if (!tree) {
            return;
        }
        tree.forEach(function (child) {
            if (child instanceof ColumnGroup) {
                _this.depthFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
            }
            callback(child);
        });
    };
    ColumnUtils = __decorate([
        Bean('columnUtils')
    ], ColumnUtils);
    return ColumnUtils;
}(BeanStub));
export { ColumnUtils };
