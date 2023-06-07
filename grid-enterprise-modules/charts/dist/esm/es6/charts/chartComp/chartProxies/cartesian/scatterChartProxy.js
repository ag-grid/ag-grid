import { CartesianChartProxy } from "./cartesianChartProxy";
import { ChartDataModel } from "../../model/chartDataModel";
export class ScatterChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(_params) {
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
    getSeries(params) {
        const paired = this.isPaired();
        const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        const series = seriesDefinitions.map(seriesDefinition => ({
            type: this.standaloneChartType,
            xKey: seriesDefinition.xField.colId,
            xName: seriesDefinition.xField.displayName,
            yKey: seriesDefinition.yField.colId,
            yName: seriesDefinition.yField.displayName,
            title: `${seriesDefinition.yField.displayName} vs ${seriesDefinition.xField.displayName}`,
            sizeKey: seriesDefinition.sizeField ? seriesDefinition.sizeField.colId : undefined,
            sizeName: seriesDefinition.sizeField ? seriesDefinition.sizeField.displayName : undefined,
            labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId,
            labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined,
        }));
        return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
    }
    extractCrossFilterSeries(series, params) {
        const { data } = params;
        const palette = this.getChartPalette();
        const filteredOutKey = (key) => `${key}-filtered-out`;
        const calcMarkerDomain = (data, sizeKey) => {
            var _a;
            const markerDomain = [Infinity, -Infinity];
            if (sizeKey != null) {
                for (const datum of data) {
                    const value = (_a = datum[sizeKey]) !== null && _a !== void 0 ? _a : datum[filteredOutKey(sizeKey)];
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
        const updatePrimarySeries = (series, idx) => {
            const { sizeKey } = series;
            const fill = palette === null || palette === void 0 ? void 0 : palette.fills[idx];
            const stroke = palette === null || palette === void 0 ? void 0 : palette.strokes[idx];
            let markerDomain = calcMarkerDomain(data, sizeKey);
            const marker = Object.assign(Object.assign({}, series.marker), { fill,
                stroke, domain: markerDomain });
            return Object.assign(Object.assign({}, series), { marker, highlightStyle: { item: { fill: 'yellow' } }, listeners: Object.assign(Object.assign({}, series.listeners), { nodeClick: this.crossFilterCallback }) });
        };
        const updateFilteredOutSeries = (series) => {
            let { sizeKey, yKey, xKey } = series;
            if (sizeKey != null) {
                sizeKey = filteredOutKey(sizeKey);
            }
            return Object.assign(Object.assign({}, series), { yKey: filteredOutKey(yKey), xKey: filteredOutKey(xKey), marker: Object.assign(Object.assign({}, series.marker), { fillOpacity: 0.3, strokeOpacity: 0.3 }), sizeKey, showInLegend: false, listeners: Object.assign(Object.assign({}, series.listeners), { nodeClick: (e) => {
                        const value = e.datum[filteredOutKey(xKey)];
                        // Need to remove the `-filtered-out` suffixes from the event so that
                        // upstream processing maps the event correctly onto grid column ids.
                        const filterableEvent = Object.assign(Object.assign({}, e), { xKey, datum: Object.assign(Object.assign({}, e.datum), { [xKey]: value }) });
                        this.crossFilterCallback(filterableEvent);
                    } }) });
        };
        const updatedSeries = series.map(updatePrimarySeries);
        return [
            ...updatedSeries,
            ...updatedSeries.map(updateFilteredOutSeries),
        ];
    }
    getSeriesDefinitions(fields, paired) {
        if (fields.length < 2) {
            return [];
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhdHRlckNoYXJ0UHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9jaGFydFByb3hpZXMvY2FydGVzaWFuL3NjYXR0ZXJDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQVE1RCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsbUJBQW1CO0lBRXRELFlBQW1CLE1BQXdCO1FBQ3ZDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQXFCO1FBQ2hDLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsUUFBUTthQUNyQjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxNQUFNO2FBQ25CO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBb0I7UUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQy9CLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0UsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUVsSCxNQUFNLE1BQU0sR0FBNkIsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUMvRTtZQUNJLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CO1lB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