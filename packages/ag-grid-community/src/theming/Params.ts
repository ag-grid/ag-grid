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

    mergedWith(other: Params): Params {
        const thisParamsCopy = { ...this.values };
        for (const [mode, otherParams] of Object.entries(other.values)) {
            if (otherParams) {
                const thisParamsModeCopy = { ...(thisParamsCopy[mode] || {}) };
                for (const [name, otherValue] of Object.entries(otherParams)) {
                    if (otherValue !== undefined) {
                        thisParamsModeCopy[name] = otherValue;
                    }
                }
                thisParamsCopy[mode] = thisParamsModeCopy;
            }
        }
        return new Params(thisParamsCopy);
    }
}
