// ag-grid-enterprise v21.2.2
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var pivotColDefService_1 = require("./pivotColDefService");
var PivotStage = /** @class */ (function () {
    function PivotStage() {
        this.uniqueValues = {};
    }
    PivotStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        var changedPath = params.changedPath;
        if (this.columnController.isPivotActive()) {
            this.executePivotOn(rootNode, changedPath);
        }
        else {
            this.executePivotOff(changedPath);
        }
    };
    PivotStage.prototype.executePivotOff = function (changedPath) {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        if (this.columnController.isSecondaryColumnsPresent()) {
            this.columnController.setSecondaryColumns(null, "rowModelUpdated");
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    };
    PivotStage.prototype.executePivotOn = function (rootNode, changedPath) {
        var uniqueValues = this.bucketUpRowNodes(rootNode);
        var uniqueValuesChanged = this.setUniqueValues(uniqueValues);
        var aggregationColumns = this.columnController.getValueColumns();
        var aggregationColumnsHash = aggregationColumns.map(function (column) { return column.getId(); }).join('#');
        var aggregationFuncsHash = aggregationColumns.map(function (column) { return column.getAggFunc().toString(); }).join('#');
        var aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        var aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;
        if (uniqueValuesChanged || aggregationColumnsChanged || aggregationFuncsChanged) {
            var result = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
            this.pivotColumnGroupDefs = result.pivotColumnGroupDefs;
            this.pivotColumnDefs = result.pivotColumnDefs;
            this.columnController.setSecondaryColumns(this.pivotColumnGroupDefs, "rowModelUpdated");
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
    // returns true if values were different
    PivotStage.prototype.bucketUpRowNodes = function (rootNode) {
        var _this = this;
        // accessed from inside inner function
        var uniqueValues = {};
        // finds all leaf groups and calls mapRowNode with it
        var recursivelySearchForLeafNodes = function (rowNode) {
            if (rowNode.leafGroup) {
                _this.bucketRowNode(rowNode, uniqueValues);
            }
            else {
                rowNode.childrenAfterFilter.forEach(function (child) {
                    recursivelySearchForLeafNodes(child);
                });
            }
        };
        recursivelySearchForLeafNodes(rootNode);
        return uniqueValues;
    };
    PivotStage.prototype.bucketRowNode = function (rowNode, uniqueValues) {
        var pivotColumns = this.columnController.getPivotColumns();
        if (pivotColumns.length === 0) {
            rowNode.childrenMapped = null;
            return;
        }
        rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
    };
    PivotStage.prototype.bucketChildren = function (children, pivotColumns, pivotIndex, uniqueValues) {
        var _this = this;
        var mappedChildren = {};
        var pivotColumn = pivotColumns[pivotIndex];
        // map the children out based on the pivot column
        children.forEach(function (child) {
            var key = _this.valueService.getKeyForNode(pivotColumn, child);
            if (ag_grid_community_1._.missing(key)) {
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
            ag_grid_community_1._.iterateObject(mappedChildren, function (key, value) {
                result_1[key] = _this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });
            return result_1;
        }
    };
    PivotStage.prototype.getPivotColumnDefs = function () {
        return this.pivotColumnDefs;
    };
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], PivotStage.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], PivotStage.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], PivotStage.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], PivotStage.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('pivotColDefService'),
        __metadata("design:type", pivotColDefService_1.PivotColDefService)
    ], PivotStage.prototype, "pivotColDefService", void 0);
    PivotStage = __decorate([
        ag_grid_community_1.Bean('pivotStage')
    ], PivotStage);
    return PivotStage;
}());
exports.PivotStage = PivotStage;
