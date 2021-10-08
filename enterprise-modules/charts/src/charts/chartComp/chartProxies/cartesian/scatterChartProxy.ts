import {
    _,
    AgScatterSeriesOptions,
    CartesianChartOptions,
    ChartType,
    HighlightOptions,
    ScatterSeriesLabelOptions,
    ScatterSeriesOptions
} from "@ag-grid-community/core";
import {
    AgCartesianChartOptions,
    AgChart,
    CartesianChart,
    ChartTheme,
    LegendClickEvent,
    ScatterSeries
} from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
}

export class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        const options = this.iChartOptions;
        const agChartOptions = options as AgCartesianChartOptions;
        agChartOptions.autoSize = true;
        agChartOptions.axes = [{
            type: 'number',
            position: 'bottom',
            ...options.xAxis,
        }, {
            type: 'number',
            position: 'left',
            ...options.yAxis,
        }];

        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length < 2) {
            this.chart.removeAllSeries();
            return;
        }

        let fields = params.fields;

        if (this.crossFiltering) {
            // add additional filtered out field
            fields.forEach(field => {
                const crossFilteringField = {...field};
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });
        }

        const { seriesDefaults } = this.iChartOptions as any;
        const seriesDefinitions = this.getSeriesDefinitions(fields, seriesDefaults.paired);

        let dataDomain: number[] | undefined;
        if (this.crossFiltering) {
            dataDomain = this.getCrossFilteringDataDomain(seriesDefinitions, params);
        }

        const { chart } = this;

        const existingSeriesById = (chart.series as ScatterSeries[]).reduceRight((map, series, i) => {
            const matchingIndex = _.findIndex(seriesDefinitions, (s: any) =>
                s.xField.colId === series.xKey &&
                s.yField.colId === series.yKey &&
                ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey)));

            if (matchingIndex === i) {
                map.set(series.yKey, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, ScatterSeries>());

        let { fills, strokes } = this.getPalette();
        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            const fillsMod: string[] = [];
            fills.forEach(fill => {
                fillsMod.push(fill);
                fillsMod.push(this.hexToRGBA(fill, '0.3'));
            });
            fills = fillsMod;

            // introduce cross filtering transparent strokes
            const strokesMod: string[] = [];
            strokes.forEach(stroke => {
                strokesMod.push(stroke);
                strokesMod.push(this.hexToRGBA(stroke, '0.3'));
            });
            strokes = strokesMod;
        }

        const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        let previousSeries: ScatterSeries | undefined;

        seriesDefinitions.forEach((seriesDefinition, index) => {
            const existingSeries = existingSeriesById.get(seriesDefinition!.yField.colId);
            const marker = { ...seriesDefaults.marker };
            if (marker.type) { // deprecated
                marker.shape = marker.type;
                delete marker.type;
            }
            const series = existingSeries || AgChart.createComponent({
                ...seriesDefaults,
                type: 'scatter',
                fillOpacity: seriesDefaults.fill.opacity,
                strokeOpacity: seriesDefaults.stroke.opacity,
                strokeWidth: seriesDefaults.stroke.width,
                marker,
                tooltip: {
                    enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                    renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
                },
            }, 'scatter.series');

            if (!series) {
                return;
            }

            const {
                xField: xFieldDefinition,
                yField: yFieldDefinition,
                sizeField: sizeFieldDefinition
            } = seriesDefinition!;

            series.title = `${yFieldDefinition.displayName} vs ${xFieldDefinition.displayName}`;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];

            if (sizeFieldDefinition) {
                series.sizeKey = sizeFieldDefinition.colId;
                series.sizeName = sizeFieldDefinition.displayName;
            } else {
                series.sizeKey = undefined;
            }

            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            } else {
                series.labelKey = series.yKey;
            }

            const isFilteredOutYKey =  yFieldDefinition.colId.indexOf('-filtered-out') > -1;
            if (this.crossFiltering) {

                if (!isFilteredOutYKey) {
                    // sync toggling of legend item with hidden 'filtered out' item
                    chart.legend.addEventListener('click', (event: LegendClickEvent) => {
                        series!.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
                    });
                }

                if (dataDomain) {
                    series.marker.domain = dataDomain;
                }

                chart.tooltip.delay = 500;

                // hide 'filtered out' legend items
                if (isFilteredOutYKey) {
                    series!.showInLegend = false;
                }

                // add node click cross filtering callback to series
                series!.addEventListener('nodeClick', this.crossFilterCallback);
            }


            if (!existingSeries) {
                chart.addSeriesAfter(series, previousSeries);
            }

            previousSeries = series;
        });
    }

    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<ScatterSeriesOptions> {
        const options = super.extractIChartOptionsFromTheme(theme);

        const seriesDefaults = theme.getConfig<AgScatterSeriesOptions>('scatter.series.scatter');
        options.seriesDefaults = {
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: (seriesDefaults.fill && [seriesDefaults.fill]) || theme.palette.fills,
                opacity: seriesDefaults.fillOpacity,
            },
            stroke: {
                colors: (seriesDefaults.stroke && [seriesDefaults.stroke]) || theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            label: seriesDefaults.label as ScatterSeriesLabelOptions,
            marker: {
                enabled: seriesDefaults.marker!.enabled,
                shape: seriesDefaults.marker!.shape,
                size: seriesDefaults.marker!.size,
                strokeWidth: seriesDefaults.marker!.strokeWidth
            },
            highlightStyle: seriesDefaults.highlightStyle as HighlightOptions,
            listeners: seriesDefaults.listeners,
            paired: true
        } as ScatterSeriesOptions;

        return options;
    }

    public getTooltipsEnabled(): boolean {
        return this.iChartOptions.seriesDefaults.tooltip != null && !!this.iChartOptions.seriesDefaults.tooltip.enabled;
    }

    public getMarkersEnabled = (): boolean => true; // markers are always enabled on scatter charts

    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions> {
        const isBubble = this.chartType === ChartType.Bubble;
        const options = {} as CartesianChartOptions<ScatterSeriesOptions>;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            fill: {
                ...options.seriesDefaults.fill,
                opacity: isBubble ? 0.7 : 1,
            },
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                shape: 'circle',
                enabled: true,
                size: 6,
                maxSize: 30,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
            paired: true,
        };

        return options;
    }

    private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): (SeriesDefinition | null)[] {
        if (fields.length < 2) { return []; }

        const isBubbleChart = this.chartType === ChartType.Bubble;

        if (paired) {
            if (isBubbleChart) {
                return fields.map((currentXField, i) => i % 3 === 0 ? ({
                    xField: currentXField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null).filter(x => x && x.yField && x.sizeField);
            }
            return fields.map((currentXField, i) => i % 2 === 0 ? ({
                xField: currentXField,
                yField: fields[i + 1],
            }) : null).filter(x => x && x.yField);
        }

        const xField = fields[0];

        if (isBubbleChart) {
            return fields
                .map((yField, i) => i % 2 === 1 ? ({
                    xField,
                    yField,
                    sizeField: fields[i + 1],
                }) : null)
                .filter(x => x && x.sizeField);
        }

        return fields.filter((value, i) => i > 0).map(yField => ({ xField, yField }));
    }

    private getCrossFilteringDataDomain(seriesDefinitions: (SeriesDefinition | null)[], params: UpdateChartParams) {
        let domain;
        if (seriesDefinitions[0] && seriesDefinitions[0].sizeField) {
            const sizeColId = seriesDefinitions[0].sizeField!.colId;
            let allSizePoints: any[] = [];
            params.data.forEach(d => {
                if (typeof d[sizeColId] !== 'undefined') {
                    allSizePoints.push(d[sizeColId]);
                }
                if (typeof d[sizeColId + '-filtered-out'] !== 'undefined') {
                    allSizePoints.push(d[sizeColId + '-filtered-out']);
                }
            })
            if (allSizePoints.length > 0) {
                domain = [Math.min(...allSizePoints), Math.max(...allSizePoints)];
            }
        }
        return domain;
    }
}