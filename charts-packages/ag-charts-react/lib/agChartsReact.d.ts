// ag-charts-react v7.1.0
import { Component, RefObject } from "react";
import { AgChartInstance, AgChartOptions } from "ag-charts-community";
export interface AgChartProps {
    options: AgChartOptions;
    onChartReady?: (chart: AgChartInstance) => void;
    containerStyle?: any;
}
interface AgChartState {
}
export declare class AgChartsReact extends Component<AgChartProps, AgChartState> {
    props: AgChartProps;
    static propTypes: any;
    chart: AgChartInstance;
    protected chartRef: RefObject<HTMLElement>;
    constructor(props: AgChartProps);
    render(): import("react").DetailedReactHTMLElement<{
        style: any;
        ref: RefObject<HTMLElement>;
    }, HTMLElement>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    private applyContainerIfNotSet;
    shouldComponentUpdate(nextProps: any): boolean;
    processPropsChanges(prevProps: any, nextProps: any): void;
    componentWillUnmount(): void;
}
export {};
