import React, { useState } from 'react';
import classnames from 'classnames';
import { Chart } from './Chart';
import { Options } from './Options';
import { ChartTypeSelector } from './ChartTypeSelector';
import { CodeView } from './CodeView';
import styles from './ChartsApiExplorer.module.scss';
import { Launcher } from './Launcher';

const createOptionsJson = (chartType, options) => {
    const optionsHasAxes = (options.axes && Object.keys(options.axes).length > 0);
    const isTwoNumberAxes = ['scatter', 'histogram'].indexOf(chartType) > -1;
    const shouldProvideAxisConfig = optionsHasAxes || isTwoNumberAxes;

    const json = {
        ...options,
        axes: shouldProvideAxisConfig ? [{
            type: isTwoNumberAxes ? 'number' : 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            ...options.axes,
        }] : undefined,
    };

    const { gridStyle, crossLines } = json.axes?.[1] ?? {};

    if (gridStyle) {
        // special handling for gridStyle which requires an array
        json.axes[1].gridStyle = [gridStyle];
    }

    if (crossLines) {
        // special handling for crossLines which requires an array
        json.axes[1].crossLines = [crossLines];
    }

    switch (chartType) {
        case 'column':
            json.series = ['revenue', 'profit'].map(yKey => ({
                type: 'column',
                xKey: 'month',
                yKey,
                stacked: true,
                ...options.series,
            }));
            break;
        case 'bar':
            json.series = ['revenue', 'profit'].map(yKey => ({
                type: 'bar',
                xKey: 'month',
                yKey,
                stacked: true,
                ...options.series,
            }));
            break;
        case 'line':
            json.series = [{
                type: 'line',
                xKey: 'month',
                yKey: 'revenue',
                ...options.series,
            },
            {
                type: 'line',
                xKey: 'month',
                yKey: 'profit',
            }];
            break;
        case 'area':
            json.series = ['revenue', 'profit'].map(yKey => ({
                type: 'area',
                xKey: 'month',
                yKey,
                stacked: true,
                ...options.series,
            }));
            break;
        case 'scatter':
            json.series = [{
                type: 'scatter',
                xKey: 'revenue',
                yKey: 'profit',
                ...options.series,
            }];
            break;
        case 'pie':
            json.series = [{
                type: 'pie',
                angleKey: 'revenue',
                calloutLabelKey: 'month',
                ...options.series,
            }];
            const firstSeries = json.series?.[0];
            if (firstSeries?.innerLabels) {
                // special handling for inner labels which requires an array
                firstSeries.innerLabels = [firstSeries.innerLabels];
            }
            break;
        case 'histogram':
            json.series = [{
                type: 'histogram',
                xKey: 'revenue',
                yKey: 'profit',
                ...options.series,
            }];
            break;
        default:
            throw new Error(`Unrecognised chart type: ${chartType}`);
    }

    return json;
};

/**
 * The Standalone Charts API Explorer is an interactive tool for exploring the charts API. The user can change different
 * settings and see how they affect the appearance of the chart, and it will generate the code they would need to use in
 * the framework of their choice.
 */
export const ChartsApiExplorer = ({ framework }) => {
    const [chartType, setChartType] = useState('column');
    const [options, setOptions] = useState({});
    const [defaults, setDefaults] = useState({});
    const [fullScreen, setFullScreen] = useState(false);
    const [fullScreenGraph, setFullScreenGraph] = useState(false);

    const getKeys = expression => expression.split('.');

    const getDefaultValue = expression => {
        const keys = getKeys(expression);
        let value = { ...defaults };

        while (keys.length > 0 && value != null) {
            value = value[keys.shift()];
        }

        return value;
    };

    const updateOption = (expression, value, requiresWholeObject = false) => {
        const keys = getKeys(expression);
        const parentKeys = [...keys];
        parentKeys.pop();
        const defaultParent = { ...getDefaultValue(parentKeys.join('.')) || defaults };
        const newOptions = { ...options };
        let objectToUpdate = newOptions;
        const lastKeyIndex = keys.length - 1;

        for (let i = 0; i < lastKeyIndex; i++) {
            const key = keys[i];
            const parent = objectToUpdate;

            if (parent[key] == null) {
                objectToUpdate = requiresWholeObject && i === lastKeyIndex - 1 ? defaultParent : {};
            } else {
                objectToUpdate = { ...parent[key] };
            }

            parent[key] = objectToUpdate;
        }

        objectToUpdate[keys[lastKeyIndex]] = value;

        setOptions(newOptions);
    };

    const updateChartType = type => {
        if (chartType === type) { return; }

        setChartType(type);
        setDefaults({});
        setOptions({});
    };

    const optionsJson = createOptionsJson(chartType, options);

    return (
        <div className={classnames(styles['explorer-container'], {[styles['fullscreen']]: fullScreen})}>
            <div className={styles['explorer-container__launcher']}>
                <Launcher
                    options={optionsJson}
                    {...{framework, fullScreen, fullScreenGraph, setFullScreen, setFullScreenGraph}}
                />
            </div>
            <div>
                <ChartTypeSelector type={chartType} onChange={updateChartType} />
            </div>
            <div className={styles['explorer-container__body']}>
                <div className={styles['explorer-container__left']}>
                    <div className={styles['explorer-container__options']}>
                        <Options
                            chartType={chartType}
                            axisType={'number'}
                            updateOption={updateOption}
                        />
                    </div>
                </div>
                <div className={styles['explorer-container__right']}>
                    <div className={styles['explorer-container__chart']}><Chart options={optionsJson} fullScreen={fullScreenGraph} setFullScreen={setFullScreenGraph} /></div>
                    <div className={styles['explorer-container__code']}><CodeView framework={framework} options={optionsJson} /></div>
                </div>
            </div>
        </div>
    );
};

export default ChartsApiExplorer;
