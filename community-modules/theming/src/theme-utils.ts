export const kebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m}`).toLowerCase();

export const paramToVariableName = (paramName: string) => `--ag-${kebabCase(paramName)}`;

export const paramToVariableExpression = (paramName: string) => `var(${paramToVariableName(paramName)})`;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const logErrorMessage = (message: unknown, error?: unknown) => {
    if (error) {
        console.error(message, error);
    } else {
        console.error(message);
    }
};

export const proportionToPercent = (value: number) => Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;

export const camelCase = (str: string) => str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());

export const memoize = <R, A = void>(fn: (arg: A) => R): ((arg: A) => R) => {
    const values = new Map<A, R>();
    return (a) => {
        const key = a;
        if (!values.has(key)) {
            values.set(key, fn(a));
        }
        return values.get(key)!;
    };
};
