var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, Autowired } from '../context/context.mjs';
import { BeanStub } from '../context/beanStub.mjs';
import { exists } from '../utils/generic.mjs';
let ValueParserService = class ValueParserService extends BeanStub {
    parseValue(column, rowNode, newValue, oldValue) {
        const colDef = column.getColDef();
        const params = {
            node: rowNode,
            data: rowNode === null || rowNode === void 0 ? void 0 : rowNode.data,
            oldValue,
            newValue,
            colDef,
            column,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        const valueParser = colDef.valueParser;
        if (exists(valueParser)) {
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    }
};
__decorate([
    Autowired('expressionService')
], ValueParserService.prototype, "expressionService", void 0);
ValueParserService = __decorate([
    Bean('valueParserService')
], ValueParserService);
export { ValueParserService };
