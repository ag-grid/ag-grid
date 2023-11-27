"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylingService = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
let StylingService = class StylingService extends beanStub_1.BeanStub {
    processAllCellClasses(colDef, params, onApplicableClass, onNotApplicableClass) {
        this.processClassRules(undefined, colDef.cellClassRules, params, onApplicableClass, onNotApplicableClass);
        this.processStaticCellClasses(colDef, params, onApplicableClass);
    }
    processClassRules(previousClassRules, classRules, params, onApplicableClass, onNotApplicableClass) {
        if (classRules == null && previousClassRules == null) {
            return;
        }
        const classesToApply = {};
        const classesToRemove = {};
        const forEachSingleClass = (className, callback) => {
            // in case className = 'my-class1 my-class2', we need to split into individual class names
            className.split(' ').forEach(singleClass => {
                if (singleClass.trim() == '')
                    return;
                callback(singleClass);
            });
        };
        if (classRules) {
            const classNames = Object.keys(classRules);
            for (let i = 0; i < classNames.length; i++) {
                const className = classNames[i];
                const rule = classRules[className];
                let resultOfRule;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                }
                else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                forEachSingleClass(className, singleClass => {
                    resultOfRule ? classesToApply[singleClass] = true : classesToRemove[singleClass] = true;
                });
            }
        }
        if (previousClassRules && onNotApplicableClass) {
            Object.keys(previousClassRules).forEach(className => forEachSingleClass(className, singleClass => {
                if (!classesToApply[singleClass]) {
                    // if we're not applying a previous class now, make sure we remove it
                    classesToRemove[singleClass] = true;
                }
            }));
        }
        // we remove all classes first, then add all classes second,
        // in case a class appears in more than one rule, this means it will be added
        // if appears in at least one truthy rule
        if (onNotApplicableClass) {
            Object.keys(classesToRemove).forEach(onNotApplicableClass);
        }
        Object.keys(classesToApply).forEach(onApplicableClass);
    }
    getStaticCellClasses(colDef, params) {
        const { cellClass } = colDef;
        if (!cellClass) {
            return [];
        }
        let classOrClasses;
        if (typeof cellClass === 'function') {
            const cellClassFunc = cellClass;
            classOrClasses = cellClassFunc(params);
        }
        else {
            classOrClasses = cellClass;
        }
        if (typeof classOrClasses === 'string') {
            classOrClasses = [classOrClasses];
        }
        return classOrClasses || [];
    }
    processStaticCellClasses(colDef, params, onApplicableClass) {
        const classOrClasses = this.getStaticCellClasses(colDef, params);
        classOrClasses.forEach((cssClassItem) => {
            onApplicableClass(cssClassItem);
        });
    }
};
__decorate([
    (0, context_1.Autowired)('expressionService')
], StylingService.prototype, "expressionService", void 0);
StylingService = __decorate([
    (0, context_1.Bean)('stylingService')
], StylingService);
exports.StylingService = StylingService;
