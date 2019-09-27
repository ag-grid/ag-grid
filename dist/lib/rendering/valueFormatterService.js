/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var expressionService_1 = require("../valueService/expressionService");
var ValueFormatterService = /** @class */ (function () {
    function ValueFormatterService() {
    }
    ValueFormatterService.prototype.formatValue = function (column, rowNode, $scope, value) {
        var formatter;
        var colDef = column.getColDef();
        // if floating, give preference to the floating formatter
        if (rowNode && rowNode.rowPinned) {
            formatter = colDef.pinnedRowValueFormatter ? colDef.pinnedRowValueFormatter : colDef.valueFormatter;
        }
        else {
            formatter = colDef.valueFormatter;
        }
        var result = null;
        if (formatter) {
            var params = {
                value: value,
                node: rowNode,
                data: rowNode ? rowNode.data : null,
                colDef: column.getColDef(),
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            // originally we put the angular 1 scope here, but we don't want the scope
            // in the params interface, as other frameworks will see the interface, and
            // angular 1 is not cool any more. so we hack the scope in here (we cannot
            // include it above, as it's not in the interface, so would cause a compile error).
            // in the future, when we stop supporting angular 1, we can take this out.
            params.$scope = $scope;
            result = this.expressionService.evaluate(formatter, params);
        }
        else if (colDef.refData) {
            return colDef.refData[value] || '';
        }
        // if we don't do this, then arrays get displayed as 1,2,3, but we want 1, 2, 3 (ie with spaces)
        if ((result === null || result === undefined) && Array.isArray(value)) {
            result = value.join(', ');
        }
        return result;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ValueFormatterService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'),
        __metadata("design:type", expressionService_1.ExpressionService)
    ], ValueFormatterService.prototype, "expressionService", void 0);
    ValueFormatterService = __decorate([
        context_1.Bean('valueFormatterService')
    ], ValueFormatterService);
    return ValueFormatterService;
}());
exports.ValueFormatterService = ValueFormatterService;
