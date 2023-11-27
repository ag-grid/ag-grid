"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.ValueParserService = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var generic_1 = require("../utils/generic");
var ValueParserService = /** @class */ (function (_super) {
    __extends(ValueParserService, _super);
    function ValueParserService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValueParserService.prototype.parseValue = function (column, rowNode, newValue, oldValue) {
        var colDef = column.getColDef();
        var params = {
            node: rowNode,
            data: rowNode === null || rowNode === void 0 ? void 0 : rowNode.data,
            oldValue: oldValue,
            newValue: newValue,
            colDef: colDef,
            column: column,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        var valueParser = colDef.valueParser;
        if ((0, generic_1.exists)(valueParser)) {
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    };
    __decorate([
        (0, context_1.Autowired)('expressionService')
    ], ValueParserService.prototype, "expressionService", void 0);
    ValueParserService = __decorate([
        (0, context_1.Bean)('valueParserService')
    ], ValueParserService);
    return ValueParserService;
}(beanStub_1.BeanStub));
exports.ValueParserService = ValueParserService;
