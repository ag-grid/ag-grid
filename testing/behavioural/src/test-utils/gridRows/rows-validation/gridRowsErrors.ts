import type { IRowNode, RowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import { GridRowErrors } from './gridRowErrors';
import type { GridRowsErrorFilter } from './gridRowErrors';

export class GridRowsErrors<TData = any> {
    public readonly default = new GridRowErrors<TData>(this, null);
    public totalErrorsCount = 0;
    public validated = false;
    public errorFilter: GridRowsErrorFilter | null = null;

    #rowsErrors = new Map<RowNode<TData> | null, GridRowErrors<TData>>([[null, this.default]]);

    public getAll(): GridRowErrors<TData>[] {
        const result: GridRowErrors<TData>[] = [];
        for (const entry of this.#rowsErrors.values()) {
            if (entry.errors.size > 0) {
                result.push(entry);
            }
        }
        return result;
    }

    public get(row: IRowNode<TData> | null | undefined): GridRowErrors<TData> {
        const rowNode = (row ?? null) as RowNode<TData> | null;
        let result = this.#rowsErrors.get(rowNode);
        if (!result) {
            result = new GridRowErrors<TData>(this, rowNode);
            this.#rowsErrors.set(rowNode, result);
        }
        return result;
    }

    /** Adds an error for a row. Non-string or empty values are silently ignored. */
    public add(row: IRowNode<TData> | null | undefined, error: string | false | null | undefined): void {
        this.get(row).add(error);
    }

    public throwIfAny(callerFn: (...args: any[]) => any = this.throwIfAny): void {
        if (this.totalErrorsCount > 0) {
            const error = new Error('❌ Grid rows errors:\n' + this.toString());
            Error.captureStackTrace(error, callerFn);
            throw error;
        }
    }

    public toString(options?: { exclude: ReadonlySet<RowNode<TData> | null> }): string {
        let result = '';
        const exclude = options?.exclude;
        for (const x of this.getAll()) {
            if (exclude?.has(x.rowNode)) {
                continue;
            }
            const { rowNode } = x;
            result += rowNode ? '* row ' + rowIdAndIndexToString(rowNode) + ' errors:\n' : '* grid errors:\n';
            result += x.toString('  ');
        }
        return result;
    }

    public clear(): void {
        this.validated = false;
        for (const item of this.#rowsErrors.values()) {
            item.clear();
        }
    }
}
