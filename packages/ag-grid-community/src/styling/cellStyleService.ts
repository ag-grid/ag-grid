import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { CellClassParams, ColDef } from '../entities/colDef';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import {
    _applyCellClassRules,
    _applyCellClassesFromColDef,
    _applyCellUserStyles,
    _setupCellCustomStyle,
} from './cellCustomStyleFeature';
import { processClassRules } from './stylingUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class CellStyleService extends BeanStub implements NamedBean {
    beanName = 'cellStyles' as const;

    public processAllCellClasses(
        colDef: ColDef,
        params: CellClassParams,
        onApplicableClass: (className: string) => void,
        onNotApplicableClass?: (className: string) => void
    ) {
        processClassRules(
            this.beans.expressionSvc,
            undefined,
            colDef.cellClassRules,
            params,
            onApplicableClass,
            onNotApplicableClass
        );
        this.processStaticCellClasses(colDef, params, onApplicableClass);
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

    public setupCellCustomStyle(cellCtrl: CellCtrl): void {
        _setupCellCustomStyle(this.beans, cellCtrl);
    }

    public applyCellUserStyles(cellCtrl: CellCtrl): void {
        _applyCellUserStyles(this.beans, cellCtrl);
    }

    public applyCellClassesFromColDef(cellCtrl: CellCtrl): void {
        _applyCellClassesFromColDef(this.beans, cellCtrl);
    }

    public applyCellClassRules(cellCtrl: CellCtrl): void {
        _applyCellClassRules(this.beans, cellCtrl);
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
