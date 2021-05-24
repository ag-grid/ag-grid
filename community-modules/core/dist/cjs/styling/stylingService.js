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
var object_1 = require("../utils/object");
var StylingService = /** @class */ (function (_super) {
    __extends(StylingService, _super);
    function StylingService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StylingService.prototype.processAllCellClasses = function (colDef, params, onApplicableClass, onNotApplicableClass) {
        this.processClassRules(colDef.cellClassRules, params, onApplicableClass, onNotApplicableClass);
        this.processStaticCellClasses(colDef, params, onApplicableClass);
    };
    StylingService.prototype.processClassRules = function (classRules, params, onApplicableClass, onNotApplicableClass) {
        if (object_1.isNonNullObject(classRules)) {
            var classNames = Object.keys(classRules);
            for (var i = 0; i < classNames.length; i++) {
                var className = classNames[i];
                var rule = classRules[className];
                var resultOfRule = void 0;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                }
                else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                if (resultOfRule) {
                    onApplicableClass(className);
                }
                else if (onNotApplicableClass) {
                    onNotApplicableClass(className);
                }
            }
        }
    };
    StylingService.prototype.processStaticCellClasses = function (colDef, params, onApplicableClass) {
        var cellClass = colDef.cellClass;
        if (cellClass) {
            var classOrClasses = void 0;
            if (typeof colDef.cellClass === 'function') {
                var cellClassFunc = colDef.cellClass;
                classOrClasses = cellClassFunc(params);
            }
            else {
                classOrClasses = colDef.cellClass;
            }
            if (typeof classOrClasses === 'string') {
                onApplicableClass(classOrClasses);
            }
            else if (Array.isArray(classOrClasses)) {
                classOrClasses.forEach(function (cssClassItem) {
                    onApplicableClass(cssClassItem);
                });
            }
        }
    };
    __decorate([
        context_1.Autowired('expressionService')
    ], StylingService.prototype, "expressionService", void 0);
    StylingService = __decorate([
        context_1.Bean('stylingService')
    ], StylingService);
    return StylingService;
}(beanStub_1.BeanStub));
exports.StylingService = StylingService;

//# sourceMappingURL=stylingService.js.map
