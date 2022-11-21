import { Component, createElement, createRef, RefObject } from "react";
import * as PropTypes from "prop-types";
import { AgChartInstance, AgChart, AgChartOptions } from "ag-charts-community";

export interface AgChartProps {
    options: AgChartOptions;
}

interface AgChartState {
}

export class AgChartsReact extends Component<AgChartProps, AgChartState> {
    static propTypes: any;

    private chart!: AgChartInstance;

    protected chartRef: RefObject<HTMLElement>;

    constructor(public props: any, public state: any) {
        super(props, state);
        this.chartRef = createRef();
    }

    render() {
        return createElement<any>("div", {
            style: this.createStyleForDiv(),
            ref: this.chartRef
        });
    }

    createStyleForDiv() {
        return {
            height: "100%",
            ...this.props.containerStyle
        };
    }

    componentDidMount() {
        const options = this.applyContainerIfNotSet(this.props.options);
        this.chart = AgChart.create(options);
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
        AgChart.update(this.chart, this.applyContainerIfNotSet(nextProps.options));
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

AgChartsReact.propTypes = {
    options: PropTypes.object
};

