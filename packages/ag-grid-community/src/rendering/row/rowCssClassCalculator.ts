import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { RowClassParams } from '../../entities/gridOptions';
import type { RowNode } from '../../entities/rowNode';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { StylingService } from '../../styling/stylingService';
import { _pushAll } from '../../utils/array';
import { _warnOnce } from '../../utils/function';
import { _exists } from '../../utils/generic';

export interface RowCssClassCalculatorParams {
    rowNode: RowNode;
    rowIsEven: boolean;
    rowLevel: number;
    fullWidthRow?: boolean;
    firstRowOnPage: boolean;
    lastRowOnPage: boolean;
    printLayout: boolean;
    expandable: boolean;

    pinned: ColumnPinnedType;
    extraCssClass?: string;
    rowFocused?: boolean;
    fadeRowIn?: boolean;
}

export class RowCssClassCalculator extends BeanStub implements NamedBean {
    beanName = 'rowCssClassCalculator' as const;

    private stylingService: StylingService;

    public wireBeans(beans: BeanCollection): void {
        this.stylingService = beans.stylingService;
    }

    public getInitialRowClasses(params: RowCssClassCalculatorParams): string[] {
        const classes: string[] = [];

        if (_exists(params.extraCssClass)) {
            classes.push(params.extraCssClass);
        }

        classes.push('ag-row');
        classes.push(params.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');

        if (params.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }

        classes.push(params.rowIsEven ? 'ag-row-even' : 'ag-row-odd');

        if (params.rowNode.isRowPinned()) {
            classes.push('ag-row-pinned');
        }

        if (params.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (params.rowNode.footer) {
            classes.push('ag-row-footer');
        }

        classes.push('ag-row-level-' + params.rowLevel);

        if (params.rowNode.stub) {
            classes.push('ag-row-loading');
        }

        if (params.fullWidthRow) {
            classes.push('ag-full-width-row');
        }

        if (params.expandable) {
            classes.push('ag-row-group');
            classes.push(params.rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }

        if (params.rowNode.dragging) {
            classes.push('ag-row-dragging');
        }

        _pushAll(classes, this.processClassesFromGridOptions(params.rowNode));
        _pushAll(classes, this.preProcessRowClassRules(params.rowNode));

        // we use absolute position unless we are doing print layout
        classes.push(params.printLayout ? 'ag-row-position-relative' : 'ag-row-position-absolute');

        if (params.firstRowOnPage) {
            classes.push('ag-row-first');
        }

        if (params.lastRowOnPage) {
            classes.push('ag-row-last');
        }

        if (params.fullWidthRow) {
            if (params.pinned === 'left') {
                classes.push('ag-cell-last-left-pinned');
            }
            if (params.pinned === 'right') {
                classes.push('ag-cell-first-right-pinned');
            }
        }

        return classes;
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
            if (typeof rowClass === 'function') {
                _warnOnce('rowClass should not be a function, please use getRowClass instead');
                return [];
            }
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

    private preProcessRowClassRules(rowNode: RowNode): string[] {
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

        this.stylingService.processClassRules(
            undefined,
            this.gos.get('rowClassRules'),
            rowClassParams,
            onApplicableClass,
            onNotApplicableClass
        );
    }

    public calculateRowLevel(rowNode: RowNode): number {
        if (rowNode.group) {
            return rowNode.level;
        }

        // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
        return rowNode.parent ? rowNode.parent.level + 1 : 0;
    }
}
