import React from 'react';
import { data, series } from './templates.jsx';
import { deepClone } from './utils.jsx';
import styles from './Chart.module.scss';

/**
 * This renders the chart inside the Standalone Charts API Explorer.
 */
export class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }

    chartInstance = undefined;
    animationFrameId = 0;
    AgChart = undefined;

    componentDidMount() {
        import('ag-charts-community').then(({ AgChart }) => {
            this.AgChart = AgChart;
            this.createChart();
        });
    }

    componentDidUpdate(prevProps) {
        const oldSeriesType = prevProps.options.series[0].type;
        const newSeriesType = this.props.options.series[0].type;
        const hasChangedType = newSeriesType !== oldSeriesType;

        if (this.chartInstance && !hasChangedType) {
            cancelAnimationFrame(this.animationFrameId);

            this.animationFrameId = requestAnimationFrame(() => {
                this.AgChart.update(this.chartInstance, this.createOptionsJson());
            });
        } else {
            this.chartInstance && this.chartInstance.destroy();
            this.createChart();
        }
    }

    createChart() {
        this.chartInstance = this.AgChart.create(this.createOptionsJson());
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
        return <div id="chart-container" className={styles['chart']} ref={this.chart}></div>;
    }
}
