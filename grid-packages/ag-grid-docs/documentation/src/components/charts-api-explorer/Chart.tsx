import React from 'react';
import { AgChartOptions } from 'ag-charts-community';
import classnames from 'classnames';

import { data, series } from './templates';
import { deepClone } from './utils';
import styles from './Chart.module.scss';
import { doOnEnter } from '../key-handlers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress } from '@fortawesome/free-solid-svg-icons';

/**
 * This renders the chart inside the Standalone Charts API Explorer.
 */
export class Chart extends React.Component<{ options: AgChartOptions, fullScreen: boolean, setFullScreen(o: boolean) }> {
    chart: React.RefObject<HTMLDivElement>;
    chartInstance = undefined;
    AgChart = undefined;

    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }    

    componentDidMount() {
        import('ag-charts-community').then(({ AgChart }) => {
            this.AgChart = AgChart;
            this.createChart();
        });
    }

    componentWillUnmount() {
        this.chartInstance?.destroy();
        this.chartInstance = undefined;
    }

    componentDidUpdate(prevProps) {
        const oldSeriesType = prevProps.options.series[0].type;
        const newSeriesType = this.props.options.series[0].type;
        const hasChangedType = newSeriesType !== oldSeriesType;

        if (this.chartInstance && !hasChangedType) {
            this.AgChart.update(this.chartInstance, this.createOptionsJson());
        } else {
            this.chartInstance?.destroy();
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
        const cssClasses = classnames(styles['chart'], {[styles['fullscreen']]: this.props.fullScreen});
        return <>
            <div
                id="chart-container"
                className={cssClasses}
                ref={this.chart}
            >
            </div>
            {this.props.fullScreen && <div
                className={styles['close']}
                onClick={() => this.props.setFullScreen(false)}
                onKeyDown={e => doOnEnter(e, () => this.props.setFullScreen(false))}
                role="button"
                tabIndex={0}
            >
                <FontAwesomeIcon icon={faCompress} fixedWidth title="Exit chart fullscreen" />
            </div>
        }
        </>;
    }
}
