import { AgCartesianAxisOptions, AgScatterSeriesMarker, AgScatterSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { ChartDataModel } from "../../chartDataModel";

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
}

export class ScatterChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.supportsAxesUpdates = false;
        this.xAxisType = 'number';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    public getData(params: UpdateChartParams): any[] {
        return this.getDataTransformedData(params);
    }

    public getAxes(): AgCartesianAxisOptions[] {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: 'bottom',
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: 'left',
            },
        ];
    }

    public getSeries(params: UpdateChartParams): AgScatterSeriesOptions[] {
        const paired = this.chartOptions[this.standaloneChartType].paired;
        const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;

        const series: AgScatterSeriesOptions[] = seriesDefinitions.map(seriesDefinition => (
            {
                ...this.extractSeriesOverrides(),
                type: this.standaloneChartType,
                xKey: seriesDefinition!.xField.colId,
                xName: seriesDefinition!.xField.displayName,
                yKey: seriesDefinition!.yField.colId,
                yName: seriesDefinition!.yField.displayName,
                title: `${seriesDefinition!.yField.displayName} vs ${seriesDefinition!.xField.displayName}`,
                sizeKey: seriesDefinition!.sizeField ? seriesDefinition!.sizeField.colId : undefined,
                sizeName: seriesDefinition!.sizeField ? seriesDefinition!.sizeField.displayName : undefined,
                labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition!.yField.colId,
                labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined,
            }
        ));

        return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
    }

    private extractCrossFilterSeries(
        series: AgScatterSeriesOptions[],
        params: UpdateChartParams,
    ): AgScatterSeriesOptions[] {
        const { data } = params;
        const { chartTheme: { palette } } = this;

        const filteredOutKey = (key: string) => `${key}-filtered-out`;

        const calcMarkerDomain = (data: any, sizeKey?: string) => {
            const markerDomain: [number, number] = [Infinity, -Infinity];
            if (sizeKey != null) {
                for (const datum of data) {
                    const value = datum[sizeKey] ?? datum[filteredOutKey(sizeKey)];
                    if (value < markerDomain[0]) {
                        markerDomain[0] = value;
                    }
                    if (value > markerDomain[1]) {
                        markerDomain[1] = value;
                    }
                }
            }
            if (markerDomain[0] <= markerDomain[1]) {
                return markerDomain;
            }
            return undefined;
        };

        const updatePrimarySeries = (series: AgScatterSeriesOptions, idx: number): AgScatterSeriesOptions => {
            const { sizeKey } = series;
            const fill = palette.fills[idx];
            const stroke = palette.strokes[idx];

            let markerDomain = calcMarkerDomain(data, sizeKey);
            const marker: AgScatterSeriesMarker<any> = {
                ...series.marker,
                fill,
                stroke,
                domain: markerDomain,
            };

            return {
                ...series,
                marker,
                highlightStyle: { item: { fill: 'yellow' } },
                listeners: {
                    ...series.listeners,
                    nodeClick: this.crossFilterCallback
                },
            };
        }

        const updateFilteredOutSeries = (series: AgScatterSeriesOptions): AgScatterSeriesOptions => {
            let { sizeKey, yKey, xKey } = series;
            if (sizeKey != null) {
                sizeKey = filteredOutKey(sizeKey);
            }

            return {
                ...series,
                yKey: filteredOutKey(yKey!),
                xKey: filteredOutKey(xKey!),
                marker: {
                    ...series.marker,
                    fillOpacity: 0.3,
                    strokeOpacity: 0.3,
                },
                sizeKey,
                showInLegend: false,
                listeners: {
                    ...series.listeners,
                    nodeClick: (e: any) => {
                        const value = e.datum[filteredOutKey(xKey!)];

                        // Need to remove the `-filtered-out` suffixes from the event so that
                        // upstream processing maps the event correctly onto grid column ids.
                        const filterableEvent = {
                            ...e,
                            xKey,
                            datum: { ...e.datum, [xKey!]: value },
                        };
                        this.crossFilterCallback(filterableEvent);
                    }
                },
            };
        };

        const updatedSeries = series.map(updatePrimarySeries);
        return [
            ...updatedSeries,
            ...updatedSeries.map(updateFilteredOutSeries),
        ];
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
}