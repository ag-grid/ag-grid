import type { AgBubbleSeriesOptions, AgCartesianAxisOptions, AgScatterSeriesOptions } from 'ag-charts-community';

import { ChartDataModel } from '../../model/chartDataModel';
import type { ChartProxyParams, FieldDefinition, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
    filterField?: FieldDefinition;
}

export class ScatterChartProxy extends CartesianChartProxy<'scatter' | 'bubble'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(_params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: 'number',
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams): (AgScatterSeriesOptions | AgBubbleSeriesOptions)[] {
        const [category] = params.categories;
        const paired = this.isPaired();
        const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        const labelFieldDefinition = category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : category;

        const series = seriesDefinitions.map((seriesDefinition) => {
            if (seriesDefinition?.sizeField) {
                const opts: AgBubbleSeriesOptions = {
                    type: 'bubble',
                    xKey: seriesDefinition!.xField.colId,
                    xName: seriesDefinition!.xField.displayName ?? undefined,
                    yKey: seriesDefinition!.yField.colId,
                    yName: seriesDefinition!.yField.displayName ?? undefined,
                    title: `${seriesDefinition!.yField.displayName} vs ${seriesDefinition!.xField.displayName}`,
                    sizeKey: seriesDefinition!.sizeField.colId,
                    sizeName: seriesDefinition!.sizeField.displayName ?? '',
                    labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition!.yField.colId,
                    labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined,
                    ...(this.crossFiltering && {
                        xFilterKey: `${seriesDefinition!.xField.colId}Filter`,
                        yFilterKey: `${seriesDefinition!.yField.colId}Filter`,
                        sizeFilterKey: `${seriesDefinition!.sizeField.colId}Filter`,
                    }),
                };
                return opts;
            }

            const opts: AgScatterSeriesOptions = {
                type: 'scatter',
                xKey: seriesDefinition!.xField.colId,
                xName: seriesDefinition!.xField.displayName ?? undefined,
                yKey: seriesDefinition!.yField.colId,
                yName: seriesDefinition!.yField.displayName ?? undefined,
                title: `${seriesDefinition!.yField.displayName} vs ${seriesDefinition!.xField.displayName}`,
                labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition!.yField.colId,
                labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined,
                ...(this.crossFiltering && {
                    xFilterKey: `${seriesDefinition!.xField.colId}Filter`,
                    yFilterKey: `${seriesDefinition!.yField.colId}Filter`,
                }),
            };
            return opts;
        });

        return series;
    }

    private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): (SeriesDefinition | null)[] {
        if (fields.length < 2) {
            return [];
        }

        const isBubbleChart = this.chartType === 'bubble';

        if (paired) {
            if (isBubbleChart) {
                return fields
                    .map((currentXField, i) =>
                        i % 3 === 0
                            ? {
                                  xField: currentXField,
                                  yField: fields[i + 1],
                                  sizeField: fields[i + 2],
                              }
                            : null
                    )
                    .filter((x) => x && x.yField && x.sizeField);
            }
            return fields
                .map((currentXField, i) =>
                    i % 2 === 0
                        ? {
                              xField: currentXField,
                              yField: fields[i + 1],
                          }
                        : null
                )
                .filter((x) => x && x.yField);
        }

        const xField = fields[0];

        if (isBubbleChart) {
            return fields
                .map((yField, i) =>
                    i % 2 === 1
                        ? {
                              xField,
                              yField,
                              sizeField: fields[i + 1],
                          }
                        : null
                )
                .filter((x) => x && x.sizeField);
        }

        return fields.filter((value, i) => i > 0).map((yField) => ({ xField, yField }));
    }
}
