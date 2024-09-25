import util from 'util';

import type { IRowNode } from 'ag-grid-community';
import type { RowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../grid-test-utils';

export class GridRowErrors<TData = any> implements GridRowErrors<TData> {
    #errors = new Set<string>();

    public get errors(): ReadonlySet<string> {
        return this.#errors;
    }

    public constructor(
        public readonly owner: GridRowsErrors<TData>,
        public readonly rowNode: RowNode<TData> | null
    ) {
        this.rowNode = rowNode;
    }

    public add(error: string): void {
        if (!this.#errors.has(error)) {
            this.#errors.add(error);
            ++this.owner.totalErrorsCount;
        }
    }

    public expectValueEqual<TValue extends string | number | boolean | null | undefined>(
        name: string,
        value: TValue,
        expected: string | number | boolean | null | undefined
    ): TValue {
        if (value !== expected) {
            this.add(`${name} expected ${JSON.stringify(expected)}, but got ${JSON.stringify(value)}.`);
        }
        return value;
    }

    public toString(prefix: string = ''): string {
        let result = '';
        for (const error of this.errors) {
            result += prefix + '❌ ' + error + '\n';
        }
        return result;
    }

    public clear(): void {
        this.owner.totalErrorsCount -= this.#errors.size;
        this.#errors.clear();
    }

    [util.inspect.custom](): string {
        return this.toString();
    }
}

export class GridRowsErrors<TData = any> {
    public readonly default = new GridRowErrors<TData>(this, null);
    public totalErrorsCount = 0;
    public validated = false;

    #rowsErrors = new Map<RowNode<TData> | null, GridRowErrors<TData>>([[null, this.default]]);

    public getAll(): GridRowErrors<TData>[] {
        return Array.from(this.#rowsErrors.values()).filter((x) => x.errors.size > 0);
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

    public throwIfAny(callerFn: Function = this.throwIfAny): void {
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
            if (!exclude?.has(x.rowNode)) {
                const { rowNode } = x;
                result += rowNode ? '* row ' + rowIdAndIndexToString(rowNode) + ' errors:\n' : '* grid errors:\n';
                result += x.toString('  ');
            }
        }
        return result;
    }

    public clear(): void {
        this.validated = false;
        for (const item of this.#rowsErrors.values()) {
            item.clear();
        }
    }

    [util.inspect.custom](): string {
        return this.toString();
    }
}
