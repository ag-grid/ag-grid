import util from 'util';

import type { RowNode } from 'ag-grid-community';

import type { GridRowsErrors } from './gridRowsErrors';

/** Callback invoked before adding an error. Return false to suppress the error. */
export type GridRowsErrorFilter = (error: string, rowNode: RowNode | null) => boolean;

export class GridRowErrors<TData = any> {
    #errors = new Set<string>();

    public get errors(): ReadonlySet<string> {
        return this.#errors;
    }

    public constructor(
        public readonly owner: GridRowsErrors<TData>,
        public readonly rowNode: RowNode<TData> | null
    ) {}

    /** Adds an error. Non-string or empty values are silently ignored. */
    public add(error: string | false | null | undefined): void {
        if (!error) {
            return;
        }
        if (this.owner.errorFilter && !this.owner.errorFilter(error, this.rowNode)) {
            return;
        }
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
