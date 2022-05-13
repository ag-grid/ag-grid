import { AgChart, CartesianChart, ChartAxisPosition, LegendClickEvent, ScatterSeries } from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { hexToRGBA } from "../../utils/color";

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
}

export class ScatterChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = 'number';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            type: 'scatter',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
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

        const paired = this.chartOptions[this.standaloneChartType].paired;
        const seriesDefinitions = this.getSeriesDefinitions(fields, paired);

        let dataDomain: number[] | undefined;
        if (this.crossFiltering) {
            dataDomain = this.getCrossFilteringDataDomain(seriesDefinitions, params);
        }

        const { chart } = this;

        const existingSeriesById = (chart.series as ScatterSeries[]).reduceRight((map, series, i) => {
            const matchingIndex = seriesDefinitions.findIndex((s: any) =>
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

        let { fills, strokes } = this.chartTheme.palette;
        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            const fillsMod: string[] = [];
            fills.forEach(fill => {
                fillsMod.push(fill);
                fillsMod.push(hexToRGBA(fill, '0.3'));
            });
            fills = fillsMod;

            // introduce cross filtering transparent strokes
            const strokesMod: string[] = [];
            strokes.forEach(stroke => {
                strokesMod.push(stroke);
                strokesMod.push(hexToRGBA(stroke, '0.3'));
            });
            strokes = strokesMod;
        }

        const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        let previousSeries: ScatterSeries | undefined;

        const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
        seriesDefinitions.forEach((seriesDefinition, index) => {
            const existingSeries = existingSeriesById.get(seriesDefinition!.yField.colId);
            const series = existingSeries || AgChart.createComponent({
                ...seriesOverrides,
                type: 'scatter',
            }, 'scatter.series');

            if (!series) { return; }

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
                    // chart.legend.addEventListener('click', (event: LegendClickEvent) => {
                    //     series!.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
                    // });
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

    private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): (SeriesDefinition | null)[] {
        if (fields.length < 2) { return []; }

        const isBubbleChart = this.chartType === 'bubble';

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

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left,
            },
        ];
    }
}