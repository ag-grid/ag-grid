/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var ValueFormatterService = /** @class */ (function (_super) {
    __extends(ValueFormatterService, _super);
    function ValueFormatterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValueFormatterService.prototype.formatValue = function (column, node, $scope, value, suppliedFormatter, useFormatterFromColumn) {
        if (useFormatterFromColumn === void 0) { useFormatterFromColumn = true; }
        var result = null;
        var formatter;
        var colDef = column.getColDef();
        if (suppliedFormatter) {
            // use supplied formatter if provided, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        }
        else if (useFormatterFromColumn) {
            // if row is pinned, give preference to the pinned formatter
            formatter = node && node.rowPinned && colDef.pinnedRowValueFormatter ?
                colDef.pinnedRowValueFormatter : colDef.valueFormatter;
        }
        if (formatter) {
            var params = {
                value: value,
                node: node,
                data: node ? node.data : null,
                colDef: colDef,
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
        // if we don't do this, then arrays get displayed as 1,2,3, but we want 1, 2, 3 (i.e. with spaces)
        if (result == null && Array.isArray(value)) {
            result = value.join(', ');
        }
        return result;
    };
    __decorate([
        context_1.Autowired('expressionService')
    ], ValueFormatterService.prototype, "expressionService", void 0);
    ValueFormatterService = __decorate([
        context_1.Bean('valueFormatterService')
    ], ValueFormatterService);
    return ValueFormatterService;
}(beanStub_1.BeanStub));
exports.ValueFormatterService = ValueFormatterService;

//# sourceMappingURL=valueFormatterService.js.map
