// ag-charts-react v1.0.0
import { Component, RefObject } from "react";
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
export interface AgChartOptions {
    width?: number;
    height?: number;
    data?: any[];
    series: {
        type?: string;
        xKey: string;
        yKey: string;
    }[];
    legend?: AgLegendProps;
}
export interface AgChartProps {
    options: AgChartOptions;
}
interface AgChartState {
}
export declare class AgChartsReact extends Component<AgChartProps, AgChartState> {
    props: any;
    state: any;
    static propTypes: any;
    private chart;
    protected chartRef: RefObject<HTMLElement>;
    constructor(props: any, state: any);
    render(): import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => Component<any, any, any>)>) | (new (props: any) => Component<any, any, any>)>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    private applyContainerIfNotSet;
    shouldComponentUpdate(nextProps: any): boolean;
    processPropsChanges(prevProps: any, nextProps: any): void;
    componentWillUnmount(): void;
}
export {};
