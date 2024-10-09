import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowClassParams } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ExpressionService } from '../valueService/expressionService';
import { processClassRules } from './stylingUtils';

export function calculateRowLevel(rowNode: RowNode): number {
    if (rowNode.group) {
        return rowNode.level;
    }

    // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
    return rowNode.parent ? rowNode.parent.level + 1 : 0;
}

export class RowStyleService extends BeanStub implements NamedBean {
    beanName = 'rowStyleService' as const;

    private expressionService?: ExpressionService;

    public wireBeans(beans: BeanCollection): void {
        this.expressionService = beans.expressionService;
    }

    public processClassesFromGridOptions(rowNode: RowNode): string[] {
        const res: string[] = [];

        const process = (rowCls: string | string[] | undefined) => {
            if (typeof rowCls === 'string') {
                res.push(rowCls);
            } else if (Array.isArray(rowCls)) {
                rowCls.forEach((e) => res.push(e));
            }
        };

        // part 1 - rowClass
        const rowClass = this.gos.get('rowClass');
        if (rowClass) {
            process(rowClass);
        }

        // part 2 - rowClassFunc
        const rowClassFunc = this.gos.getCallback('getRowClass');

        if (rowClassFunc) {
            const params: WithoutGridCommon<RowClassParams> = {
                data: rowNode.data,
                node: rowNode,
                rowIndex: rowNode.rowIndex!,
            };
            const rowClassFuncResult = rowClassFunc(params);
            process(rowClassFuncResult);
        }

        return res;
    }

    public preProcessRowClassRules(rowNode: RowNode): string[] {
        const res: string[] = [];

        this.processRowClassRules(
            rowNode,
            (className: string) => {
                res.push(className);
            },
            () => {
                // not catered for, if creating, no need
                // to remove class as it was never there
            }
        );

        return res;
    }

    public processRowClassRules(
        rowNode: RowNode,
        onApplicableClass: (className: string) => void,
        onNotApplicableClass?: (className: string) => void
    ): void {
        const rowClassParams: RowClassParams = this.gos.addGridCommonParams({
            data: rowNode.data,
            node: rowNode,
            rowIndex: rowNode.rowIndex!,
        });

        processClassRules(
            this.expressionService,
            undefined,
            this.gos.get('rowClassRules'),
            rowClassParams,
            onApplicableClass,
            onNotApplicableClass
        );
    }
}
