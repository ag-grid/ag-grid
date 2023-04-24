import { FontStyle, FontWeight } from './agChartOptions';
export declare class Label {
    enabled: boolean;
    fontSize: number;
    fontFamily: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    color: string;
    getFont(): string;
}
export declare function calculateLabelRotation(opts: {
    rotation?: number;
    parallel?: boolean;
    regularFlipRotation?: number;
    parallelFlipRotation?: number;
}): {
    labelRotation: number;
    autoRotation: number;
    parallelFlipFlag: number;
    regularFlipFlag: number;
};
