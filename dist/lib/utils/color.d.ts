// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class Color {
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
     * The given string can be in one of the following formats:
     * - #rgb
     * - #rrggbb
     * - rgb(r, g, b)
     * - rgba(r, g, b, a)
     * - CSS color name such as 'white', 'orange', 'cyan', etc.
     * @param str
     */
    static fromString(str: string): Color;
    private static hexRe;
    private static shortHexRe;
    static fromHexString(str: string): Color;
    private static rgbRe;
    private static rgbaRe;
    static fromRgbaString(str: string): Color;
    static fromArray(arr: [number, number, number] | [number, number, number, number]): Color;
    static fromHSB(h: number, s: number, b: number, alpha?: number): Color;
    private static padHex;
    toHexString(): string;
    toRgbaString(fractionDigits?: number): string;
    toString(): string;
    toHSB(): [number, number, number];
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
    /**
     * CSS Color Module Level 4:
     * https://drafts.csswg.org/css-color/#named-colors
     */
    private static nameToHex;
}
