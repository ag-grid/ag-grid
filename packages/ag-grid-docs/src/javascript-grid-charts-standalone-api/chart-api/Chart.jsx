import React from 'react';
import './Chart.css';
import { AgChart } from "ag-charts-community";
import { data, series } from "./templates.jsx";
import { deepClone } from "./utils.jsx";

export class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
        this.useDynamicUpdates = true;
    }

    chartInstance = undefined;

    componentDidMount() {
        this.createChart();
    }

    componentDidUpdate() {
        if (this.chartInstance && this.useDynamicUpdates) {
            AgChart.update(this.chartInstance, this.createOptionsJson());
        } else {
            this.chartInstance && this.chartInstance.destroy();
            this.createChart();
        }
    }

    createChart() {
        this.chartInstance = AgChart.create(this.createOptionsJson());
    }

    createOptionsJson() {
        return {
            container: this.chart.current,
            data,
            series,
            ...deepClone(this.props.options),
        };
    }

    render() {
        return <div className="chart" ref={this.chart}></div>;
    }
}
