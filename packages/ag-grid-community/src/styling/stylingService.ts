import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CellClassParams, ColDef } from '../entities/colDef';
import type { RowClassParams } from '../entities/gridOptions';
import type { ExpressionService } from '../valueService/expressionService';

export class StylingService extends BeanStub implements NamedBean {
    beanName = 'stylingService' as const;

    private expressionService?: ExpressionService;

    public wireBeans(beans: BeanCollection): void {
        this.expressionService = beans.expressionService;
    }

    public processAllCellClasses(
        colDef: ColDef,
        params: CellClassParams,
        onApplicableClass: (className: string) => void,
        onNotApplicableClass?: (className: string) => void
    ) {
        this.processClassRules(undefined, colDef.cellClassRules, params, onApplicableClass, onNotApplicableClass);
        this.processStaticCellClasses(colDef, params, onApplicableClass);
    }

    public processClassRules(
        previousClassRules: { [cssClassName: string]: ((...args: any[]) => any) | string } | undefined,
        classRules: { [cssClassName: string]: ((...args: any[]) => any) | string } | undefined,
        params: RowClassParams | CellClassParams,
        onApplicableClass: (className: string) => void,
        onNotApplicableClass?: (className: string) => void
    ) {
        if (classRules == null && previousClassRules == null) {
            return;
        }

        const classesToApply: { [name: string]: boolean } = {};
        const classesToRemove: { [name: string]: boolean } = {};

        const forEachSingleClass = (className: string, callback: (singleClass: string) => void) => {
            // in case className = 'my-class1 my-class2', we need to split into individual class names
            className.split(' ').forEach((singleClass) => {
                if (singleClass.trim() == '') return;
                callback(singleClass);
            });
        };

        if (classRules) {
            const classNames = Object.keys(classRules);
            for (let i = 0; i < classNames.length; i++) {
                const className = classNames[i];
                const rule = classRules![className];

                let resultOfRule: any;

                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService ? this.expressionService.evaluate(rule, params) : true;
                } else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }

                forEachSingleClass(className, (singleClass) => {
                    resultOfRule ? (classesToApply[singleClass] = true) : (classesToRemove[singleClass] = true);
                });
            }
        }
        if (previousClassRules && onNotApplicableClass) {
            Object.keys(previousClassRules).forEach((className) =>
                forEachSingleClass(className, (singleClass) => {
                    if (!classesToApply[singleClass]) {
                        // if we're not applying a previous class now, make sure we remove it
                        classesToRemove[singleClass] = true;
                    }
                })
            );
        }

        // we remove all classes first, then add all classes second,
        // in case a class appears in more than one rule, this means it will be added
        // if appears in at least one truthy rule
        if (onNotApplicableClass) {
            Object.keys(classesToRemove).forEach(onNotApplicableClass);
        }
        Object.keys(classesToApply).forEach(onApplicableClass);
    }

    public getStaticCellClasses(colDef: ColDef, params: CellClassParams): string[] {
        const { cellClass } = colDef;

        if (!cellClass) {
            return [];
        }

        let classOrClasses: string | string[] | null | undefined;

        if (typeof cellClass === 'function') {
            const cellClassFunc = cellClass;
            classOrClasses = cellClassFunc(params);
        } else {
            classOrClasses = cellClass;
        }

        if (typeof classOrClasses === 'string') {
            classOrClasses = [classOrClasses];
        }

        return classOrClasses || [];
    }

    private processStaticCellClasses(
        colDef: ColDef,
        params: CellClassParams,
        onApplicableClass: (className: string) => void
    ) {
        const classOrClasses = this.getStaticCellClasses(colDef, params);

        classOrClasses.forEach((cssClassItem: string) => {
            onApplicableClass(cssClassItem);
        });
    }
}
