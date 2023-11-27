"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueParserService = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
let ValueParserService = class ValueParserService extends beanStub_1.BeanStub {
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
        if ((0, generic_1.exists)(valueParser)) {
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    }
};
__decorate([
    (0, context_1.Autowired)('expressionService')
], ValueParserService.prototype, "expressionService", void 0);
ValueParserService = __decorate([
    (0, context_1.Bean)('valueParserService')
], ValueParserService);
exports.ValueParserService = ValueParserService;
