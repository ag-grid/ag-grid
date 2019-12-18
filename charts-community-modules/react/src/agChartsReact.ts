import {Component, createElement} from "react";
import * as PropTypes from "prop-types";
import {agChart, Chart} from "ag-charts-community";
import {ChangeDetectionService, ChangeDetectionStrategyType} from "./changeDetectionService";

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
    // seriesChangeDetectionStrategy?: ChangeDetectionStrategyType; to follow...if needed
}

interface AgChartState {
}

export class AgChartsReact extends Component<AgChartProps, AgChartState> {
    static propTypes: any;

    private destroyed = false;
    private changeDetectionService = new ChangeDetectionService();

    private chart!: Chart;

    protected eChartDiv!: HTMLElement;

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return createElement<any>("div", {
            style: this.createStyleForDiv(),
            ref: (e: HTMLElement) => {
                this.eChartDiv = e;
            }
        });
    }

    createStyleForDiv() {
        const style: any = {height: "100%"};
        // allow user to override styles
        const containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach(key => {
                style[key] = containerStyle[key];
            });
        }
        return style;
    }

    componentDidMount() {
        const options = this.applyParentIfNotSet(this.props.options);
        this.chart = agChart.create(options);
    }

    private applyParentIfNotSet(propsOptions: any) {
        const options = {...propsOptions};
        if (!options.parent) {
            options.parent = this.eChartDiv;
        }
        return options;
    }

    shouldComponentUpdate(nextProps: any) {
        this.processPropsChanges(this.props, nextProps);

        // we want full control of the dom, as ag-Charts doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    componentDidUpdate(prevProps: any) {
        this.processPropsChanges(prevProps, this.props);
    }

    processPropsChanges(prevProps: any, nextProps: any) {
        const changeDetectionStrategy = this.changeDetectionService.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);
        if (!changeDetectionStrategy.areEqual(prevProps.options, nextProps.options)) {
            agChart.reconfigure(this.chart, this.applyParentIfNotSet(nextProps.options));
        }
    }

    componentWillUnmount() {
        this.destroyed = true;
    }
}

AgChartsReact.propTypes = {
    options: PropTypes.object
};

