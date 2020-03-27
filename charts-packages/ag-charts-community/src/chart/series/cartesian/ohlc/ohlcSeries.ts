import { Selection } from "../../../../scene/selection";
import { Group } from "../../../../scene/group";
import { SeriesNodeDatum, TooltipRendererParams } from "../../series";
import { numericExtent } from "../../../../util/array";
import { toFixed } from "../../../../util/number";
import { LegendDatum } from "../../../legend";
import { OHLC } from "./marker/ohlc";
import { Candlestick } from "./marker/candlestick";
import { locale } from "../../../../util/time/format/defaultLocale";
import { CartesianSeries } from "../cartesianSeries";
import { reactive, Observable } from "../../../../util/observable";
import { ChartAxisDirection } from "../../../chartAxis";
import { Chart } from "../../../chart";

interface GroupSelectionDatum extends SeriesNodeDatum {
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    width: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
}

export interface OHLCTooltipRendererParams extends TooltipRendererParams {
    dateKey?: string;
    dateName?: string;

    openKey?: string;
    openName?: string;

    highKey?: string;
    highName?: string;

    lowKey?: string;
    lowName?: string;

    closeKey?: string;
    closeName?: string;
}

export class OHLCSeries extends CartesianSeries {

    static className = 'OHLCSeries';

    private xDomain: number[] = [];
    private yDomain: number[] = [];

    // Have data separated by key, so that we can process the minimum amount of data
    // when a key changes.
    private dateData: any[] = [];
    private openData: any[] = [];
    private highData: any[] = [];
    private lowData: any[] = [];
    private closeData: any[] = [];

    private dirtyDateData = true;
    private dirtyOpenData = true;
    private dirtyHighData = true;
    private dirtyLowData = true;
    private dirtyCloseData = true;

    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    readonly marker = new OHLCSeriesMarker();

    constructor() {
        super();

        this.marker.type = Candlestick;
        this.marker.addEventListener('styleChange', () => this.update());
        this.marker.addPropertyListener('type', () => this.onMarkerTypeChange());

        this.addEventListener('dataChange', () => {
            this.dirtyDateData = true;
            this.dirtyOpenData = true;
            this.dirtyHighData = true;
            this.dirtyLowData = true;
            this.dirtyCloseData = true;
        });
    }

    onMarkerTypeChange() {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    }

    @reactive('layoutChange') title?: string;

    protected _dateKey: string = 'date';
    set dateKey(value: string) {
        if (this._dateKey !== value) {
            this._dateKey = value;
            this.dateData = [];
            this.dirtyDateData = true;
            this.fireEvent({type: 'dataChange'});
        }
    }
    get dateKey(): string {
        return this._dateKey;
    }

    protected _openKey: string = 'open';
    set openKey(value: string) {
        if (this._openKey !== value) {
            this._openKey = value;
            this.openData = [];
            this.dirtyOpenData = true;
            this.fireEvent({type: 'dataChange'});
        }
    }
    get openKey(): string {
        return this._openKey;
    }

    protected _highKey: string = 'high';
    set highKey(value: string) {
        if (this._highKey !== value) {
            this._highKey = value;
            this.highData = [];
            this.dirtyHighData = true;
            this.fireEvent({type: 'dataChange'});
        }
    }
    get highKey(): string {
        return this._highKey;
    }

    protected _lowKey: string = 'low';
    set lowKey(value: string) {
        if (this._lowKey !== value) {
            this._lowKey = value;
            this.lowData = [];
            this.dirtyLowData = true;
            this.fireEvent({type: 'dataChange'});
        }
    }
    get lowKey(): string {
        return this._lowKey;
    }

    protected _closeKey: string = 'close';
    set closeKey(value: string) {
        if (this._closeKey !== value) {
            this._closeKey = value;
            this.closeData = [];
            this.dirtyCloseData = true;
            this.fireEvent({type: 'dataChange'});
        }
    }
    get closeKey(): string {
        return this._closeKey;
    }

    private _labelKey?: string;
    set labelKey(value: string | undefined) {
        if (this._labelKey !== value) {
            this._labelKey = value;
            this.fireEvent({type: 'dataChange'});
        }
    }
    get labelKey(): string | undefined {
        return this._labelKey;
    }

    dateName: string = 'Date';
    openName: string = 'Open';
    highName: string = 'High';
    lowName: string = 'Low';
    closeName: string = 'Close';
    labelName?: string = 'Label';

    processData(): boolean {
        const {
            dateKey, openKey, highKey, lowKey, closeKey,
            dirtyDateData, dirtyOpenData, dirtyHighData, dirtyLowData, dirtyCloseData
        } = this;

        // if (!(chart && chart.xAxis && chart.yAxis)) {
        //     return false;
        // }

        const data = dateKey && openKey && highKey && lowKey && closeKey && this.data ? this.data : [];

        if (dirtyDateData) {
            this.xDomain = this.calculateDomain(this.dateData = data.map(d => d[dateKey]));
            this.dirtyDateData = false;
        }

        if (dirtyOpenData) {
            this.openData = data.map(d => d[openKey]);
            this.dirtyOpenData = false;
        }
        if (dirtyHighData) {
            this.highData = data.map(d => d[highKey]);
            this.dirtyHighData = false;
        }
        if (dirtyLowData) {
            this.lowData = data.map(d => d[lowKey]);
            this.dirtyLowData = false;
        }
        if (dirtyCloseData) {
            this.closeData = data.map(d => d[closeKey]);
            this.dirtyCloseData = false;
        }

        if (dirtyOpenData || dirtyHighData || dirtyLowData || dirtyCloseData) {
            const yDomains = new Array<any>().concat(this.openData, this.highData, this.lowData, this.closeData);
            this.yDomain = this.calculateDomain(yDomains);
        }

        return true;
    }

    private calculateDomain(data: any[]): [number, number] {
        const domain = numericExtent(data) || [0, 1];
        const [min, max] = domain;

        if (min === max) {
            domain[0] = min - 1;
            domain[1] = max + 1;
        }

        return domain;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = {
            fill: 'yellow'
        };

    protected highlightedDatum?: GroupSelectionDatum;

    update(): void {
        const { xAxis, yAxis } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;

        const {
            data,
            dateData,
            openData,
            highData,
            lowData,
            closeData,
            marker,
            highlightedDatum
        } = this;

        const Marker = marker.type;

        const groupSelectionData: GroupSelectionDatum[] = dateData.map((dateDatum, i) => {
            const open = openData[i];
            const close = closeData[i];
            const yOpen = yScale.convert(open) + yOffset;
            const yClose = yScale.convert(close) + yOffset;

            return {
                series: this,
                seriesDatum: data[i],
                date: xScale.convert(dateDatum) + xOffset,
                open: yOpen,
                high: yScale.convert(highData[i]) + yOffset,
                low: yScale.convert(lowData[i]) + yOffset,
                close: yClose,
                fill: close > open ? marker.upFill : close < open ? marker.downFill : marker.noChangeFill,
                stroke: close > open ? marker.upStroke : close < open ? marker.downStroke : marker.noChangeStroke,
                strokeWidth: marker.strokeWidth,
                width: 3
            };
        });

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Marker);

        const groupSelection = updateGroups.merge(enterGroups);
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;

        groupSelection.selectByClass(Marker)
            .each((node, datum) => {
                const highlighted = highlightedDatum &&
                    highlightedDatum.series === datum.series &&
                    highlightedDatum.seriesDatum === datum.seriesDatum;
                node.date = datum.date;
                node.open = datum.open;
                node.high = datum.high;
                node.low = datum.low;
                node.close = datum.close;
                node.width = datum.width;
                node.fill = highlighted && highlightFill !== undefined ? highlightFill : datum.fill;
                node.stroke = highlighted && highlightStroke !== undefined ? highlightStroke : datum.stroke;
                node.fillOpacity = marker.fillOpacity;
                node.strokeOpacity = marker.strokeOpacity;
                node.strokeWidth = datum.strokeWidth;
                node.visible = datum.width > 0;
            });

        this.groupSelection = groupSelection;
    }

    private dateFormatter = locale.format('%d %b, %Y');

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        const { dateKey, openKey, highKey, lowKey, closeKey } = this;

        if (!(dateKey && openKey && highKey && lowKey && closeKey)) {
            return '';
        }

        const {
            title,
            tooltipRenderer,
            dateName,
            openName,
            highName,
            lowName,
            closeName,
            labelKey,
            labelName
        } = this;

        const color = nodeDatum.fill || 'gray';

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                dateKey,
                openKey,
                highKey,
                lowKey,
                closeKey,

                dateName,
                openName,
                highName,
                lowName,
                closeName,

                title,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleHtml = title ? `<div class="${Chart.defaultTooltipClass}-title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const dateValue = seriesDatum[dateKey];
            const openValue = seriesDatum[openKey];
            const highValue = seriesDatum[highKey];
            const lowValue = seriesDatum[lowKey];
            const closeValue = seriesDatum[closeKey];
            let contentHtml = `<b>${dateName}</b>: ${this.dateFormatter(dateValue)}`
                + `<br><b>${openName}</b>: ${toFixed(openValue)}`
                + `<br><b>${highName}</b>: ${toFixed(highValue)}`
                + `<br><b>${lowName}</b>: ${toFixed(lowValue)}`
                + `<br><b>${closeName}</b>: ${toFixed(closeValue)}`;

            if (labelKey) {
                contentHtml = `<b>${labelName}</b>: ${seriesDatum[labelKey]}<br>` + contentHtml;
            }

            return `${titleHtml}<div class="${Chart.defaultTooltipClass}-content">${contentHtml}</div>`;
        }
    }

    tooltipRenderer?: (params: OHLCTooltipRendererParams) => string;

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            data, id, dateKey, closeKey,
            title, visible
        } = this;

        if (data && data.length && dateKey && closeKey) {
            legendData.push({
                id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || closeKey
                },
                marker: {
                    fill: 'gray',
                    stroke: 'black',
                    fillOpacity: 1,
                    strokeOpacity: 1
                }
            });
        }
    }
}

export class OHLCSeriesMarker extends Observable {
    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    @reactive() type: new () => OHLC = Candlestick;

    @reactive('styleChange') upFill?: string = '#33ae5b';
    @reactive('styleChange') downFill?: string = '#ff4734';
    @reactive('styleChange') noChangeFill?: string = '#b9bdc5';

    @reactive('styleChange') upStroke?: string = 'black';
    @reactive('styleChange') downStroke?: string = 'black';
    @reactive('styleChange') noChangeStroke?: string = 'black';


    @reactive('styleChange') strokeWidth = 1;
    @reactive('styleChange') fillOpacity = 1;
    @reactive('styleChange') strokeOpacity = 1;
}
