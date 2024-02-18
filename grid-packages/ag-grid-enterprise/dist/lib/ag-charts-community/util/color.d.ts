export interface IColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
}
export declare class Color implements IColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    /**
     * Every color component should be in the [0, 1] range.
     * Some easing functions (such as elastic easing) can overshoot the target value by some amount.
     * So, when animating colors, if the source or target color components are already near
     * or at the edge of the allowed [0, 1] range, it is possible for the intermediate color
     * component value to end up outside of that range mid-animation. For this reason the constructor
     * performs range checking/constraining.
     * @param r Red component.
     * @param g Green component.
     * @param b Blue component.
     * @param a Alpha (opacity) component.
     */
    constructor(r: number, g: number, b: number, a?: number);
    /**
     * A color string can be in one of the following formats to be valid:
     * - #rgb
     * - #rrggbb
     * - rgb(r, g, b)
     * - rgba(r, g, b, a)
     * - CSS color name such as 'white', 'orange', 'cyan', etc.
     */
    static validColorString(str: string): boolean;
    /**
     * The given string can be in one of the following formats:
     * - #rgb
     * - #rrggbb
     * - rgb(r, g, b)
     * - rgba(r, g, b, a)
     * - CSS color name such as 'white', 'orange', 'cyan', etc.
     * @param str
     */
    static fromString(str: string): Color;
    static tryParseFromString(str: string): Color;
    static parseHex(input: string): [number, number, number, number] | undefined;
    static fromHexString(str: string): Color;
    private static stringToRgba;
    static fromRgbaString(str: string): Color;
    static fromArray(arr: [number, number, number] | [number, number, number, number]): Color;
    static fromHSB(h: number, s: number, b: number, alpha?: number): Color;
    static fromHSL(h: number, s: number, l: number, alpha?: number): Color;
    static fromOKLCH(l: number, c: number, h: number, alpha?: number): Color;
    private static padHex;
    toHexString(): string;
    toRgbaString(fractionDigits?: number): string;
    toString(): string;
    toHSB(): [number, number, number];
    static didDebug: boolean;
    static RGBtoOKLCH(r: number, g: number, b: number): [number, number, number];
    static OKLCHtoRGB(l: number, c: number, h: number): [number, number, number];
    static RGBtoHSL(r: number, g: number, b: number): [number, number, number];
    static HSLtoRGB(h: number, s: number, l: number): [number, number, number];
    /**
     * Converts the given RGB triple to an array of HSB (HSV) components.
     * The hue component will be `NaN` for achromatic colors.
     */
    static RGBtoHSB(r: number, g: number, b: number): [number, number, number];
    /**
     * Converts the given HSB (HSV) triple to an array of RGB components.
     */
    static HSBtoRGB(H: number, S: number, B: number): [number, number, number];
    private derive;
    brighter(): Color;
    darker(): Color;
    static interpolate(color: string, other: string): (t: number) => string;
    /**
     * CSS Color Module Level 4:
     * https://drafts.csswg.org/css-color/#named-colors
     */
    private static nameToHex;
}
