/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, Autowired } from '../context/context';
import { BeanStub } from "../context/beanStub";
let ValueFormatterService = class ValueFormatterService extends BeanStub {
    formatValue(column, node, value, suppliedFormatter, useFormatterFromColumn = true) {
        let result = null;
        let formatter;
        const colDef = column.getColDef();
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
            const params = {
                value,
                node,
                data: node ? node.data : null,
                colDef,
                column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
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
    }
};
__decorate([
    Autowired('expressionService')
], ValueFormatterService.prototype, "expressionService", void 0);
ValueFormatterService = __decorate([
    Bean('valueFormatterService')
], ValueFormatterService);
export { ValueFormatterService };
