export declare function prepareFinalAnimationStyles(previousStyles: {
    [key: string]: string | number;
}, newStyles: {
    [key: string]: string | number;
}, nullValue?: string): {
    [key: string]: string;
};
export declare function balanceAnimationKeyframes(collectedStyles: {
    [key: string]: string | number;
}, finalStateStyles: {
    [key: string]: string | number;
}, keyframes: any[]): any[];
export declare function clearStyles(styles: {
    [key: string]: string | number;
}): {
    [key: string]: string;
};
export declare function collectAndResolveStyles(collection: {
    [key: string]: string | number;
}, styles: {
    [key: string]: string | number;
}[]): {
    [key: string]: string | number;
}[];
export declare function renderStyles(element: any, renderer: any, styles: {
    [key: string]: string | number;
}): void;
export declare function flattenStyles(styles: {
    [key: string]: string | number;
}[]): {
    [key: string]: string;
};
