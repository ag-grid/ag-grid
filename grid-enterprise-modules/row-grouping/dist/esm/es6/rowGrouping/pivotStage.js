var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
let PivotStage = class PivotStage extends BeanStub {
    constructor() {
        super(...arguments);
        this.uniqueValues = {};
    }
    execute(params) {
        const changedPath = params.changedPath;
        if (this.columnModel.isPivotActive()) {
            this.executePivotOn(changedPath);
        }
        else {
            this.executePivotOff(changedPath);
        }
    }
    executePivotOff(changedPath) {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        if (this.columnModel.isSecondaryColumnsPresent()) {
            this.columnModel.setSecondaryColumns(null, "rowModelUpdated");
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }
    executePivotOn(changedPath) {
        const uniqueValues = this.bucketUpRowNodes(changedPath);
        const uniqueValuesChanged = this.setUniqueValues(uniqueValues);
        const aggregationColumns = this.columnModel.getValueColumns();
        const aggregationColumnsHash = aggregationColumns.map((column) => `${column.getId()}-${column.getColDef().headerName}`).join('#');
        const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc().toString()).join('#');
        const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;
        const groupColumnsHash = this.columnModel.getRowGroupColumns().map((column) => column.getId()).join('#');
        const groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
        this.groupColumnsHashLastTime = groupColumnsHash;
        if (uniqueValuesChanged || aggregationColumnsChanged || groupColumnsChanged || aggregationFuncsChanged) {
            const { pivotColumnGroupDefs, pivotColumnDefs } = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
            this.pivotColumnDefs = pivotColumnDefs;
            this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
            // because the secondary columns have changed, then the aggregation needs to visit the whole
            // tree again, so we make the changedPath not active, to force aggregation to visit all paths.
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }
    setUniqueValues(newValues) {
        const json1 = JSON.stringify(newValues);
        const json2 = JSON.stringify(this.uniqueValues);
        const uniqueValuesChanged = json1 !== json2;
        // we only continue the below if the unique values are different, as otherwise
        // the result will be the same as the last time we did it
        if (uniqueValuesChanged) {
            this.uniqueValues = newValues;
            return true;
        }
        else {
            return false;
        }
    }
    bucketUpRowNodes(changedPath) {
        // accessed from inside inner function
        const uniqueValues = {};
        // ensure childrenMapped is cleared, as if a node has been filtered out it should not have mapped children.
        changedPath.forEachChangedNodeDepthFirst(node => {
            if (node.leafGroup) {
                node.childrenMapped = null;
            }
        });
        const recursivelyBucketFilteredChildren = (node) => {
            var _a;
            if (node.leafGroup) {
                this.bucketRowNode(node, uniqueValues);
            }
            else {
                (_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.forEach(recursivelyBucketFilteredChildren);
            }
        };
        changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);
        return uniqueValues;
    }
    bucketRowNode(rowNode, uniqueValues) {
        const pivotColumns = this.columnModel.getPivotColumns();
        if (pivotColumns.length === 0) {
            rowNode.childrenMapped = null;
        }
        else {
            rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
        }
        if (rowNode.sibling) {
            rowNode.sibling.childrenMapped = rowNode.childrenMapped;
        }
    }
    bucketChildren(children, pivotColumns, pivotIndex, uniqueValues) {
        const mappedChildren = {};
        const pivotColumn = pivotColumns[pivotIndex];
        // map the children out based on the pivot column
        children.forEach((child) => {
            let key = this.valueService.getKeyForNode(pivotColumn, child);
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
            const result = {};
            _.iterateObject(mappedChildren, (key, value) => {
                result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });
            return result;
        }
    }
    getPivotColumnDefs() {
        return this.pivotColumnDefs;
    }
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
export { PivotStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGl2b3RTdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9waXZvdFN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFTUixDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUlqQyxJQUFhLFVBQVUsR0FBdkIsTUFBYSxVQUFXLFNBQVEsUUFBUTtJQUF4Qzs7UUFPWSxpQkFBWSxHQUFRLEVBQUUsQ0FBQztJQTJKbkMsQ0FBQztJQWxKVSxPQUFPLENBQUMsTUFBMEI7UUFDckMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN2QyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFZLENBQUMsQ0FBQztTQUNyQzthQUFNO1lBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFZLENBQUMsQ0FBQztTQUN0QztJQUNMLENBQUM7SUFFTyxlQUFlLENBQUMsV0FBd0I7UUFDNUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQztRQUMzQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLEVBQUUsRUFBRTtZQUM5QyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlELElBQUksV0FBVyxFQUFFO2dCQUNiLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUM3QjtTQUNKO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FBQyxXQUF3QjtRQUMzQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFeEQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJ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