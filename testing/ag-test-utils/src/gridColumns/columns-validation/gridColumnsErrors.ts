import type { Column, ColumnGroup } from 'ag-grid-community';

import { GridColumnErrors } from './gridColumnErrors';
import type { GridColumnsErrorFilter } from './gridColumnErrors';

export class GridColumnsErrors {
    public readonly default = new GridColumnErrors(this, null);
    public totalErrorsCount = 0;
    public validated = false;
    public errorFilter: GridColumnsErrorFilter | null = null;

    #colErrors = new Map<Column | ColumnGroup | null, GridColumnErrors>([[null, this.default]]);

    public getAll(): GridColumnErrors[] {
        const result: GridColumnErrors[] = [];
        for (const entry of this.#colErrors.values()) {
            if (entry.errors.size > 0) {
                result.push(entry);
            }
        }
        return result;
    }

    public get(col: Column | ColumnGroup | null | undefined): GridColumnErrors {
        const key = col ?? null;
        let result = this.#colErrors.get(key);
        if (!result) {
            result = new GridColumnErrors(this, key);
            this.#colErrors.set(key, result);
        }
        return result;
    }

    /** Adds an error for a column or group. Non-string or empty values are silently ignored. */
    public add(col: Column | ColumnGroup | null | undefined, error: string | false | null | undefined): void {
        this.get(col).add(error);
    }

    public throwIfAny(callerFn: (...args: any[]) => any = this.throwIfAny): void {
        if (this.totalErrorsCount > 0) {
            const error = new Error('❌ Grid columns errors:\n' + this.toString());
            Error.captureStackTrace(error, callerFn);
            throw error;
        }
    }

    public toString(options?: { exclude?: ReadonlySet<Column | ColumnGroup | null> }): string {
        let result = '';
        const exclude = options?.exclude;
        for (const x of this.getAll()) {
            if (exclude?.has(x.column)) {
                continue;
            }
            const { column } = x;
            if (column) {
                const id = 'getColId' in column ? column.getColId() : column.getUniqueId();
                result += '* column ' + id + ' errors:\n';
            } else {
                result += '* grid columns errors:\n';
            }
            result += x.toString('  ');
        }
        return result;
    }

    public clear(): void {
        this.validated = false;
        for (const item of this.#colErrors.values()) {
            item.clear();
        }
    }
}
