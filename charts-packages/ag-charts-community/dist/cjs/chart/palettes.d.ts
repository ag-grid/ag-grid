export interface ChartPalette {
    fills: string[];
    strokes: string[];
}
export declare const borneo: ChartPalette;
export declare const material: ChartPalette;
export declare const pastel: ChartPalette;
export declare const bright: ChartPalette;
export declare const flat: ChartPalette;
export default borneo;
export declare type ChartPaletteName = 'borneo' | 'material' | 'pastel' | 'bright' | 'flat';
export declare const palettes: Map<ChartPaletteName, ChartPalette>;
