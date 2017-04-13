/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var expressionService_1 = require("../expressionService");
var StylingService = (function () {
    function StylingService() {
    }
    StylingService.prototype.processAllCellClasses = function (colDef, params, onApplicableClass, onNotApplicableClass) {
        this.processCellClassRules(colDef, params, onApplicableClass, onNotApplicableClass);
        this.processStaticCellClasses(colDef, params, onApplicableClass);
    };
    StylingService.prototype.processCellClassRules = function (colDef, params, onApplicableClass, onNotApplicableClass) {
        var classRules = colDef.cellClassRules;
        if (typeof classRules === 'object' && classRules !== null) {
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
            var classOrClasses;
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
    return StylingService;
}());
__decorate([
    context_1.Autowired('expressionService'),
    __metadata("design:type", expressionService_1.ExpressionService)
], StylingService.prototype, "expressionService", void 0);
StylingService = __decorate([
    context_1.Bean('stylingService')
], StylingService);
exports.StylingService = StylingService;
