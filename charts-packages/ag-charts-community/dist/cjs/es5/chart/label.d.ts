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
