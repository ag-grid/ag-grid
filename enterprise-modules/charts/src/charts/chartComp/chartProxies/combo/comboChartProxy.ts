import { AgCartesianAxisOptions } from "ag-charts-community";
import { ChartType, SeriesChartType } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { getSeriesType } from "../../utils/seriesTypeMapper";

export class ComboChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateChartParams): AgCartesianAxisOptions[] {
        const fields = params ? params.fields : [];
        const fieldsMap = new Map(fields.map(f => [f.colId, f]));

        const { primaryYKeys, secondaryYKeys } = this.getYKeys(fields, params.seriesChartTypes);

        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
                gridStyle: [{ stroke: undefined }],
            },
        ];

        if (primaryYKeys.length > 0) {
            axes.push({
                type: 'number',
                keys: primaryYKeys,
                position: 'left',
                title: {
                    text: primaryYKeys.map(key => {
                        const field = fieldsMap.get(key);
                        return field ? field.displayName : key;
                    }).join(' / '),
                },
            });
        }

        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach((secondaryYKey: string, i: number) => {
                const field = fieldsMap.get(secondaryYKey);
                const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }

                const secondaryAxisOptions: AgCartesianAxisOptions = {
                    type: 'number',
                    keys: [secondaryYKey],
                    position: 'right',
                    title: {
                        text: field ? field.displayName! : secondaryYKey,
                    },
                }

                const primaryYAxis = primaryYKeys.some(primaryYKey => !!fieldsMap.get(primaryYKey));
                const lastSecondaryAxis = i === secondaryYKeys.length - 1;

                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                } else {
                    secondaryAxisOptions.gridStyle = [{ stroke: undefined }];
                }

                axes.push(secondaryAxisOptions);
            });
        }

        // Allow toggling of axis titles by theme overrides.
        return axes.map((axis) => ({ ...axis, title: { ...axis.title, _enabledFromTheme: true }}));
    }

    public getSeries(params: UpdateChartParams): any {
        const { fields, category, seriesChartTypes } = params;

        return fields.map(field => {
            const seriesChartType = seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType: ChartType = seriesChartType.chartType;
                return {
                    type: getSeriesType(chartType),
                    xKey: category.id,
                    yKey: field.colId,
                    yName: field.displayName,
                    grouped: ['groupedColumn', 'groupedBar', 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea', 'stackedColumn'].includes(chartType),
                }
            }
        });
    }

    private getYKeys(fields: FieldDefinition[], seriesChartTypes: SeriesChartType[]) {
        const primaryYKeys: string[] = [];
        const secondaryYKeys: string[] = [];

        fields.forEach(field => {
            const colId = field.colId;
            const seriesChartType = seriesChartTypes.find(s => s.colId === colId);
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });

        return { primaryYKeys, secondaryYKeys };
    }
}