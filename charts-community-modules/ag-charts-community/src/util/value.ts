export const isString = (v: any) => typeof v === 'string';
export const isStringObject = (v: any) =>
    !!v && Object.prototype.hasOwnProperty.call(v, 'toString') && isString(v.toString());
export const isDate = (v: any) => v instanceof Date && !isNaN(+v);

export function isDiscrete(value: any): boolean {
    return isString(value) || isStringObject(value);
}

export function isContinuous(value: any): boolean {
    const isNumberObject = (v: any) =>
        !!v && Object.prototype.hasOwnProperty.call(v, 'valueOf') && isNumber(v.valueOf());
    const isDate = (v: any) => v instanceof Date && !isNaN(+v);

    return isNumber(value) || isNumberObject(value) || isDate(value);
}

export function checkDatum<T>(value: T, isContinuousScale: boolean): T | string | undefined {
    if (isContinuousScale && isContinuous(value)) {
        return value;
    } else if (!isContinuousScale) {
        if (!isDiscrete(value)) {
            return String(value);
        }
        return value;
    }
    return undefined;
}

export const isNumber = (v: any) => typeof v === 'number' && Number.isFinite(v);
