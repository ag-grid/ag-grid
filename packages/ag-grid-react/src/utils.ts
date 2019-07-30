// effectively Object.assign - here for IE compatibility
export const assignProperties = (to: {}, from: {}) => {
    const styleKeys: string[] = Object.keys(from);
    styleKeys.forEach((key: string)=> {
        (to as any)[key] = (from as any)[key];
    })

};
