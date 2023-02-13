import { Component, createElement, createRef, RefObject } from "react";
import * as PropTypes from "prop-types";
import { AgChartInstance, AgChart, AgChartOptions } from "ag-charts-community";

export interface AgChartProps {
    options: AgChartOptions;
    onChartReady?: (chart: AgChartInstance) => void;
    containerStyle?: any;
}

interface AgChartState {
}

export class AgChartsReact extends Component<AgChartProps, AgChartState> {
    static propTypes: any;

    public chart!: AgChartInstance;

    protected chartRef: RefObject<HTMLElement>;

    constructor(public props: AgChartProps) {
        super(props);
        this.chartRef = createRef();
    }

    render() {
        return createElement("div", {
            style: this.createStyleForDiv(),
            ref: this.chartRef
        });
    }

    createStyleForDiv() {
        return {
            height: "100%",
            ...(this.props.containerStyle ?? {})
        };
    }

    componentDidMount() {
        const options = this.applyContainerIfNotSet(this.props.options);

        const chart = AgChart.create(options);
        this.chart = chart;

        (chart as any).chart.waitForUpdate()
            .then(() => this.props.onChartReady?.(chart));
    }

    private applyContainerIfNotSet(propsOptions: any) {
        if (propsOptions.container) {
            return propsOptions;
        }

        return {...propsOptions, container: this.chartRef.current};
    }

    shouldComponentUpdate(nextProps: any) {
        this.processPropsChanges(this.props, nextProps);

        // we want full control of the dom, as AG Charts doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    processPropsChanges(prevProps: any, nextProps: any) {
        if (this.chart) {
            AgChart.update(this.chart, this.applyContainerIfNotSet(nextProps.options));
        }
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined as any;
        }
    }
}

AgChartsReact.propTypes = {
    options: PropTypes.object
};

