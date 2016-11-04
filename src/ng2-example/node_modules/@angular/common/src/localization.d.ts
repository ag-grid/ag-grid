/**
 * @experimental
 */
export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any): string;
}
/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
export declare class NgLocaleLocalization extends NgLocalization {
    private _locale;
    constructor(_locale: string);
    getPluralCategory(value: any): string;
}
/** @experimental */
export declare enum Plural {
    Zero = 0,
    One = 1,
    Two = 2,
    Few = 3,
    Many = 4,
    Other = 5,
}
/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
export declare function getPluralCase(locale: string, nLike: number | string): Plural;
