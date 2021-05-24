/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { exists } from "../../utils/generic";
import { pushAll } from "../../utils/array";
import { Autowired, Bean } from "../../context/context";
import { Constants } from "../../constants/constants";
/**
 * Common logic for RowComp and AutoHeightCalculator
 */
var RowCssClassCalculator = /** @class */ (function () {
    function RowCssClassCalculator() {
    }
    RowCssClassCalculator.prototype.getInitialRowClasses = function (params) {
        var classes = [];
        if (exists(params.extraCssClass)) {
            classes.push(params.extraCssClass);
        }
        classes.push('ag-row');
        classes.push(params.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');
        if (params.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }
        classes.push(params.rowIsEven ? 'ag-row-even' : 'ag-row-odd');
        if (params.rowNode.isRowPinned()) {
            classes.push('ag-row-pinned');
        }
        if (params.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }
        if (params.rowNode.footer) {
            classes.push('ag-row-footer');
        }
        classes.push('ag-row-level-' + params.rowLevel);
        if (params.rowNode.stub) {
            classes.push('ag-row-loading');
        }
        if (params.fullWidthRow) {
            classes.push('ag-full-width-row');
        }
        if (params.expandable) {
            classes.push('ag-row-group');
            classes.push(params.rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }
        if (params.rowNode.dragging) {
            classes.push('ag-row-dragging');
        }
        pushAll(classes, this.processClassesFromGridOptions(params.rowNode, params.scope));
        pushAll(classes, this.preProcessRowClassRules(params.rowNode, params.scope));
        // we use absolute position unless we are doing print layout
        classes.push(params.printLayout ? 'ag-row-position-relative' : 'ag-row-position-absolute');
        if (params.firstRowOnPage) {
            classes.push('ag-row-first');
        }
        if (params.lastRowOnPage) {
            classes.push('ag-row-last');
        }
        if (params.fullWidthRow) {
            if (params.pinned === Constants.PINNED_LEFT) {
                classes.push('ag-cell-last-left-pinned');
            }
            if (params.pinned === Constants.PINNED_RIGHT) {
                classes.push('ag-cell-first-right-pinned');
            }
        }
        return classes;
    };
    RowCssClassCalculator.prototype.processClassesFromGridOptions = function (rowNode, scope) {
        var res = [];
        var process = function (rowCls) {
            if (typeof rowCls === 'string') {
                res.push(rowCls);
            }
            else if (Array.isArray(rowCls)) {
                rowCls.forEach(function (e) { return res.push(e); });
            }
        };
        // part 1 - rowClass
        var rowClass = this.gridOptionsWrapper.getRowClass();
        if (rowClass) {
            if (typeof rowClass === 'function') {
                console.warn('AG Grid: rowClass should not be a function, please use getRowClass instead');
                return [];
            }
            process(rowClass);
        }
        // part 2 - rowClassFunc
        var rowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
        if (rowClassFunc) {
            var params = {
                data: rowNode.data,
                node: rowNode,
                rowIndex: rowNode.rowIndex,
                $scope: scope,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            var rowClassFuncResult = rowClassFunc(params);
            process(rowClassFuncResult);
        }
        return res;
    };
    RowCssClassCalculator.prototype.preProcessRowClassRules = function (rowNode, scope) {
        var res = [];
        this.processRowClassRules(rowNode, scope, function (className) {
            res.push(className);
        }, function (className) {
            // not catered for, if creating, no need
            // to remove class as it was never there
        });
        return res;
    };
    RowCssClassCalculator.prototype.processRowClassRules = function (rowNode, scope, onApplicableClass, onNotApplicableClass) {
        var rowClassParams = {
            data: rowNode.data,
            node: rowNode,
            rowIndex: rowNode.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            $scope: scope,
            context: this.gridOptionsWrapper.getContext()
        };
        this.stylingService.processClassRules(this.gridOptionsWrapper.rowClassRules(), rowClassParams, onApplicableClass, onNotApplicableClass);
    };
    RowCssClassCalculator.prototype.calculateRowLevel = function (rowNode) {
        if (rowNode.group) {
            return rowNode.level;
        }
        // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
        return rowNode.parent ? (rowNode.parent.level + 1) : 0;
    };
    __decorate([
        Autowired('stylingService')
    ], RowCssClassCalculator.prototype, "stylingService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], RowCssClassCalculator.prototype, "gridOptionsWrapper", void 0);
    RowCssClassCalculator = __decorate([
        Bean('rowCssClassCalculator')
    ], RowCssClassCalculator);
    return RowCssClassCalculator;
}());
export { RowCssClassCalculator };
