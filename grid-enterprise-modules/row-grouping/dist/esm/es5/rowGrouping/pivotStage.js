var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
var PivotStage = /** @class */ (function (_super) {
    __extends(PivotStage, _super);
    function PivotStage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uniqueValues = {};
        return _this;
    }
    PivotStage.prototype.execute = function (params) {
        var changedPath = params.changedPath;
        if (this.columnModel.isPivotActive()) {
            this.executePivotOn(changedPath);
        }
        else {
            this.executePivotOff(changedPath);
        }
    };
    PivotStage.prototype.executePivotOff = function (changedPath) {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        if (this.columnModel.isSecondaryColumnsPresent()) {
            this.columnModel.setSecondaryColumns(null, "rowModelUpdated");
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    };
    PivotStage.prototype.executePivotOn = function (changedPath) {
        var uniqueValues = this.bucketUpRowNodes(changedPath);
        var uniqueValuesChanged = this.setUniqueValues(uniqueValues);
        var aggregationColumns = this.columnModel.getValueColumns();
        var aggregationColumnsHash = aggregationColumns.map(function (column) { return column.getId() + "-" + column.getColDef().headerName; }).join('#');
        var aggregationFuncsHash = aggregationColumns.map(function (column) { return column.getAggFunc().toString(); }).join('#');
        var aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        var aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;
        var groupColumnsHash = this.columnModel.getRowGroupColumns().map(function (column) { return column.getId(); }).join('#');
        var groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
        this.groupColumnsHashLastTime = groupColumnsHash;
        if (uniqueValuesChanged || aggregationColumnsChanged || groupColumnsChanged || aggregationFuncsChanged) {
            var _a = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues), pivotColumnGroupDefs = _a.pivotColumnGroupDefs, pivotColumnDefs = _a.pivotColumnDefs;
            this.pivotColumnDefs = pivotColumnDefs;
            this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
            // because the secondary columns have changed, then the aggregation needs to visit the whole
            // tree again, so we make the changedPath not active, to force aggregation to visit all paths.
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    };
    PivotStage.prototype.setUniqueValues = function (newValues) {
        var json1 = JSON.stringify(newValues);
        var json2 = JSON.stringify(this.uniqueValues);
        var uniqueValuesChanged = json1 !== json2;
        // we only continue the below if the unique values are different, as otherwise
        // the result will be the same as the last time we did it
        if (uniqueValuesChanged) {
            this.uniqueValues = newValues;
            return true;
        }
        else {
            return false;
        }
    };
    PivotStage.prototype.bucketUpRowNodes = function (changedPath) {
        var _this = this;
        // accessed from inside inner function
        var uniqueValues = {};
        // ensure childrenMapped is cleared, as if a node has been filtered out it should not have mapped children.
        changedPath.forEachChangedNodeDepthFirst(function (node) {
            if (node.leafGroup) {
                node.childrenMapped = null;
            }
        });
        var recursivelyBucketFilteredChildren = function (node) {
            var _a;
            if (node.leafGroup) {
                _this.bucketRowNode(node, uniqueValues);
            }
            else {
                (_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.forEach(recursivelyBucketFilteredChildren);
            }
        };
        changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);
        return uniqueValues;
    };
    PivotStage.prototype.bucketRowNode = function (rowNode, uniqueValues) {
        var pivotColumns = this.columnModel.getPivotColumns();
        if (pivotColumns.length === 0) {
            rowNode.childrenMapped = null;
        }
        else {
            rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
        }
        if (rowNode.sibling) {
            rowNode.sibling.childrenMapped = rowNode.childrenMapped;
        }
    };
    PivotStage.prototype.bucketChildren = function (children, pivotColumns, pivotIndex, uniqueValues) {
        var _this = this;
        var mappedChildren = {};
        var pivotColumn = pivotColumns[pivotIndex];
        // map the children out based on the pivot column
        children.forEach(function (child) {
            var key = _this.valueService.getKeyForNode(pivotColumn, child);
            if (_.missing(key)) {
                key = '';
            }
            if (!uniqueValues[key]) {
                uniqueValues[key] = {};
            }
            if (!mappedChildren[key]) {
                mappedChildren[key] = [];
            }
            mappedChildren[key].push(child);
        });
        // if it's the last pivot column, return as is, otherwise go one level further in the map
        if (pivotIndex === pivotColumns.length - 1) {
            return mappedChildren;
        }
        else {
            var result_1 = {};
            _.iterateObject(mappedChildren, function (key, value) {
                result_1[key] = _this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });
            return result_1;
        }
    };
    PivotStage.prototype.getPivotColumnDefs = function () {
        return this.pivotColumnDefs;
    };
    __decorate([
        Autowired('valueService')
    ], PivotStage.prototype, "valueService", void 0);
    __decorate([
        Autowired('columnModel')
    ], PivotStage.prototype, "columnModel", void 0);
    __decorate([
        Autowired('pivotColDefService')
    ], PivotStage.prototype, "pivotColDefService", void 0);
    PivotStage = __decorate([
        Bean('pivotStage')
    ], PivotStage);
    return PivotStage;
}(BeanStub));
export { PivotStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGl2b3RTdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9waXZvdFN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFTUixDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUlqQztJQUFnQyw4QkFBUTtJQUF4QztRQUFBLHFFQWtLQztRQTNKVyxrQkFBWSxHQUFRLEVBQUUsQ0FBQzs7SUEySm5DLENBQUM7SUFsSlUsNEJBQU8sR0FBZCxVQUFlLE1BQTBCO1FBQ3JDLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDdkMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBWSxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNILElBQUksQ0FBQyxlQUFlLENBQUMsV0FBWSxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDO0lBRU8sb0NBQWUsR0FBdkIsVUFBd0IsV0FBd0I7UUFDNUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQztRQUMzQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLEVBQUUsRUFBRTtZQUM5QyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlELElBQUksV0FBVyxFQUFFO2dCQUNiLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUM3QjtTQUNKO0lBQ0wsQ0FBQztJQUVPLG1DQUFjLEdBQXRCLFVBQXVCLFdBQXdCO1FBQzNDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztR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