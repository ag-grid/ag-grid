/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylingService = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
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
        if (classRules == null) {
            return;
        }
        var classNames = Object.keys(classRules);
        var classesToApply = {};
        var classesToRemove = {};
        var _loop_1 = function (i) {
            var className = classNames[i];
            var rule = classRules[className];
            var resultOfRule;
            if (typeof rule === 'string') {
                resultOfRule = this_1.expressionService.evaluate(rule, params);
            }
            else if (typeof rule === 'function') {
                resultOfRule = rule(params);
            }
            // in case className = 'my-class1 my-class2', we need to split into individual class names
            className.split(' ').forEach(function (singleClass) {
                if (singleClass == null || singleClass.trim() == '') {
                    return;
                }
                resultOfRule ? classesToApply[singleClass] = true : classesToRemove[singleClass] = true;
            });
        };
        var this_1 = this;
        for (var i = 0; i < classNames.length; i++) {
            _loop_1(i);
        }
        // we remove all classes first, then add all classes second,
        // in case a class appears in more than one rule, this means it will be added
        // if appears in at least one truthy rule
        if (onNotApplicableClass) {
            Object.keys(classesToRemove).forEach(onNotApplicableClass);
        }
        Object.keys(classesToApply).forEach(onApplicableClass);
    };
    StylingService.prototype.getStaticCellClasses = function (colDef, params) {
        var cellClass = colDef.cellClass;
        if (!cellClass) {
            return [];
        }
        var classOrClasses;
        if (typeof cellClass === 'function') {
            var cellClassFunc = cellClass;
            classOrClasses = cellClassFunc(params);
        }
        else {
            classOrClasses = cellClass;
        }
        if (typeof classOrClasses === 'string') {
            classOrClasses = [classOrClasses];
        }
        return classOrClasses || [];
    };
    StylingService.prototype.processStaticCellClasses = function (colDef, params, onApplicableClass) {
        var classOrClasses = this.getStaticCellClasses(colDef, params);
        classOrClasses.forEach(function (cssClassItem) {
            onApplicableClass(cssClassItem);
        });
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
