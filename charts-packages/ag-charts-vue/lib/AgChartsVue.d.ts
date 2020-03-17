import { Vue } from 'vue-property-decorator';
export interface AgLegendProps {
    enabled?: boolean;
    padding?: number;
    itemPaddingX?: number;
    itemPaddingY?: number;
    markerSize?: number;
    markerStrokeWidth?: number;
    labelColor?: string;
    labelFontFamily?: string;
}
export interface Series {
    type?: string;
    xKey: string;
    yKey: string;
}
export interface AgChartOptions {
    width?: number;
    height?: number;
    data?: any[];
    series: Series[];
    legend?: AgLegendProps;
}
export declare class AgChartsVue extends Vue {
    private isCreated;
    private isDestroyed;
    private chart;
    private options;
    render(h: any): any;
    mounted(): void;
    destroyed(): void;
    private processChanges;
    private applyContainerIfNotSet;
}
