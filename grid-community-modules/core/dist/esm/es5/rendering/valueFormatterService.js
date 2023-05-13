/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { Bean, Autowired } from '../context/context';
import { BeanStub } from "../context/beanStub";
var ValueFormatterService = /** @class */ (function (_super) {
    __extends(ValueFormatterService, _super);
    function ValueFormatterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValueFormatterService.prototype.formatValue = function (column, node, value, suppliedFormatter, useFormatterFromColumn) {
        if (useFormatterFromColumn === void 0) { useFormatterFromColumn = true; }
        var result = null;
        var formatter;
        var colDef = column.getColDef();
        if (suppliedFormatter) {
            // use supplied formatter if provided, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        }
        else if (useFormatterFromColumn) {
            formatter = colDef.valueFormatter;
        }
        if (formatter) {
            var params = {
                value: value,
                node: node,
                data: node ? node.data : null,
                colDef: colDef,
                column: column,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            if (typeof formatter === 'function') {
                result = formatter(params);
            }
            else {
                result = this.expressionService.evaluate(formatter, params);
            }
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
        Autowired('expressionService')
    ], ValueFormatterService.prototype, "expressionService", void 0);
    ValueFormatterService = __decorate([
        Bean('valueFormatterService')
    ], ValueFormatterService);
    return ValueFormatterService;
}(BeanStub));
export { ValueFormatterService };
