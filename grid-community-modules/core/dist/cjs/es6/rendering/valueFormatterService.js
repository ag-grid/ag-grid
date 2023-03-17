/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.ValueFormatterService = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
let ValueFormatterService = class ValueFormatterService extends beanStub_1.BeanStub {
    formatValue(column, node, value, suppliedFormatter, useFormatterFromColumn = true) {
        let result = null;
        let formatter;
        const colDef = column.getColDef();
        if (suppliedFormatter) {
            // use supplied formatter if provided, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        }
        else if (useFormatterFromColumn) {
            formatter = colDef.valueFormatter;
        }
        if (formatter) {
            const params = {
                value,
                node,
                data: node ? node.data : null,
                colDef,
                column,
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
    }
};
__decorate([
    context_1.Autowired('expressionService')
], ValueFormatterService.prototype, "expressionService", void 0);
ValueFormatterService = __decorate([
    context_1.Bean('valueFormatterService')
], ValueFormatterService);
exports.ValueFormatterService = ValueFormatterService;
