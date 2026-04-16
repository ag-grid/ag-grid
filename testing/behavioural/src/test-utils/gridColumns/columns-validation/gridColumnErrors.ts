import util from 'util';

import type { Column, ColumnGroup } from 'ag-grid-community';

import type { GridColumnsErrors } from './gridColumnsErrors';

/** Callback invoked before adding an error. Return false to suppress the error. */
export type GridColumnsErrorFilter = (error: string, col: Column | ColumnGroup | null) => boolean;

export class GridColumnErrors {
    #errors = new Set<string>();

    public get errors(): ReadonlySet<string> {
        return this.#errors;
    }

    public constructor(
        public readonly owner: GridColumnsErrors,
        public readonly column: Column | ColumnGroup | null
    ) {}

    /** Adds an error. Non-string or empty values are silently ignored. */
    public add(error: string | false | null | undefined): void {
        if (!error) {
            return;
        }
        if (this.owner.errorFilter && !this.owner.errorFilter(error, this.column)) {
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
