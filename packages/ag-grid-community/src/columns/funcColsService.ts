import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { IColsService } from '../interfaces/iColsService';
import type { ColKey, Maybe } from './columnModel';
import type { ColumnState } from './columnStateService';

export class FuncColsService extends BeanStub implements NamedBean {
    beanName = 'funcColsService' as const;

    private rowGroupColsService: IColsService;
    private valueColsService: IColsService;
    private pivotColsService: IColsService;

    public wireBeans(beans: BeanCollection): void {
        this.rowGroupColsService = beans.rowGroupColsService!;
        this.valueColsService = beans.valueColsService!;
        this.pivotColsService = beans.pivotColsService!;
    }

    public get rowGroupCols(): AgColumn[] {
        return this.rowGroupColsService.columns;
    }

    public get valueCols(): AgColumn[] {
        return this.valueColsService.columns;
    }

    public get pivotCols(): AgColumn[] {
        return this.pivotColsService.columns;
    }

    public generateColumnStateForRowGroupAndPivotIndexes(
        updatedRowGroupColumnState: { [colId: string]: ColumnState },
        updatedPivotColumnState: { [colId: string]: ColumnState }
    ): ColumnState[] {
        // Generally columns should appear in the order they were before. For any new columns, these should appear in the original col def order.
        // The exception is for columns that were added via `addGroupColumns`. These should appear at the end.
        // We don't have to worry about full updates, as in this case the arrays are correct, and they won't appear in the updated lists.
        const updatedState: { [colId: string]: ColumnState } = {};

        this.rowGroupColsService.orderColumns(updatedState, updatedRowGroupColumnState);
        this.pivotColsService.orderColumns(updatedState, updatedPivotColumnState);

        return Object.values(updatedState);
    }
}
