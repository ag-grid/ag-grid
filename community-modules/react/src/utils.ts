// effectively Object.assign - here for IE compatibility
export const assignProperties = (to: {}, from: {}) => {
    const styleKeys: string[] = Object.keys(from);
    styleKeys.forEach((key: string) => {
        (to as any)[key] = (from as any)[key];
    })
};

/*
 * http://stackoverflow.com/a/13719799/2393347
 */
export const assign = (obj: any, prop: any, value: any) => {
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        const e = prop.shift();
        assign(
            obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {},
            prop,
            value);
    } else
        obj[prop[0]] = value;
};
