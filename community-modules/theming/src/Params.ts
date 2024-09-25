import { _mergeDeep } from '@ag-grid-community/core';

export type ParamValues = Readonly<Record<string, unknown>>;

export type ModalParamValues = Readonly<{
    [mode: string]: ParamValues | undefined;
}>;

export class Params {
    constructor(private readonly values: ModalParamValues = {}) {}

    withParams(params: ParamValues, mode: string = 'default'): Params {
        const newParams = { ...(this.values[mode] || {}) };
        for (const [name, value] of Object.entries(params)) {
            if (value !== undefined) {
                newParams[name] = value;
            }
        }
        return new Params({
            ...this.values,
            [mode]: newParams,
        });
    }

    getModes(): string[] {
        return Object.keys(this.values);
    }

    getValues(mode = 'default'): ParamValues {
        return this.values[mode] || {};
    }

    mutateMergeWith(other: Params): void {
        _mergeDeep(this.values, other.values);
    }
}
