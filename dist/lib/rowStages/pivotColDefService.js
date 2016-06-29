// ag-grid-enterprise v5.0.0-alpha.4
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var PivotColDefService = (function () {
    function PivotColDefService() {
    }
    PivotColDefService.prototype.createPivotColumnDefs = function (uniqueValues) {
        var pivotColumnGroupDefs = [];
        var pivotColumnDefs = [];
        var pivotColumns = this.columnController.getPivotColumns();
        var levelsDeep = pivotColumns.length;
        var columnIdSequence = new main_1.NumberSequence();
        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep);
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefs
        };
    };
    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    PivotColDefService.prototype.recursivelyAddGroup = function (parentChildren, pivotColumnDefs, index, uniqueValues, pivotKeys, columnIdSequence, levelsDeep) {
        var _this = this;
        main_1.Utils.iterateObject(uniqueValues, function (key, value) {
            var newPivotKeys = pivotKeys.slice(0);
            newPivotKeys.push(key);
            var createGroup = index !== levelsDeep;
            if (createGroup) {
                var groupDef = {
                    children: [],
                    headerName: key
                };
                parentChildren.push(groupDef);
                _this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index + 1, value, newPivotKeys, columnIdSequence, levelsDeep);
            }
            else {
                var measureColumns = _this.columnController.getAggregationColumns();
                var valueGroup = {
                    children: [],
                    headerName: key
                };
                parentChildren.push(valueGroup);
                measureColumns.forEach(function (measureColumn) {
                    var colDef = _this.createColDef(measureColumn, measureColumn.getColDef().headerName, newPivotKeys, columnIdSequence);
                    valueGroup.children.push(colDef);
                    pivotColumnDefs.push(colDef);
                });
                valueGroup.children.sort(_this.headerNameComparator.bind(_this));
            }
            parentChildren.sort(_this.headerNameComparator.bind(_this));
        });
    };
    PivotColDefService.prototype.createColDef = function (valueColumn, headerName, pivotKeys, columnIdSequence) {
        var colDef = {};
        if (valueColumn) {
            var colDefToCopy = valueColumn.getColDef();
            main_1.Utils.assign(colDef, colDefToCopy);
        }
        colDef.valueGetter = null;
        colDef.headerName = headerName;
        colDef.colId = 'pivot_' + columnIdSequence.next();
        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;
        return colDef;
    };
    PivotColDefService.prototype.headerNameComparator = function (a, b) {
        if (a.headerName < b.headerName) {
            return -1;
        }
        else if (a.headerName > b.headerName) {
            return 1;
        }
        else {
            return 0;
        }
    };
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], PivotColDefService.prototype, "columnController", void 0);
    PivotColDefService = __decorate([
        main_1.Bean('pivotColDefService'), 
        __metadata('design:paramtypes', [])
    ], PivotColDefService);
    return PivotColDefService;
})();
exports.PivotColDefService = PivotColDefService;
