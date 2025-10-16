/** Precompiles a fast field getter function able to get a deep field from an object. Meant to be cached. */
export const fieldGetter = <T = any, R = unknown>(
    path: string
): ((data: T | null | undefined) => R | null | undefined) => {
    const segments = path.split('.');
    if (segments.includes('__proto__')) {
        return (): any => {}; // avoid security issues
    }
    const len = segments.length;
    if (len < 2) {
        return (data: any) => data?.[path];
    }
    return (data: any) => {
        let i = 0;
        do {
            data = data?.[segments[i++]];
            if (i === len) {
                return data;
            }
        } while (typeof data === 'object');
    };
};
