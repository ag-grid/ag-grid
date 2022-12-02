export const isString = (v: any) => typeof v === 'string';
export const isStringObject = (v: any) => !!v && v.hasOwnProperty('toString') && isString(v.toString());
export const isDate = (v: any) => v instanceof Date && !isNaN(+v);

export function isDiscrete(value: any): boolean {
    if (isString(value)) {
        return true;
    } else if (isStringObject(value)) {
        return true;
    }

    return false;
}

export function isContinuous(value: any): boolean {
    const isNumberObject = (v: any) => !!v && v.hasOwnProperty('valueOf') && isNumber(v.valueOf());
    const isDate = (v: any) => v instanceof Date && !isNaN(+v);

    if (isNumber(value)) {
        return true;
    } else if (isNumberObject(value)) {
        return true;
    } else if (isDate(value)) {
        return true;
    }

    return false;
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
