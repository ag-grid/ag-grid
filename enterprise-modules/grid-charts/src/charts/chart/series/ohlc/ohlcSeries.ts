import { CartesianChart } from "../../cartesianChart";
import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import { Series, SeriesNodeDatum, TooltipRendererParams } from "../series";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import { OHLC } from "./marker/ohlc";
import { Candlestick } from "./marker/candlestick";
import { locale } from "../../../util/time/format/defaultLocale";

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

export class OHLCSeries extends Series<CartesianChart> {

    static className = 'OHLCSeries';

    private domainX: number[] = [];
    private domainY: number[] = [];

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
        this.marker.onChange = this.update.bind(this);
        this.marker.onTypeChange = this.onMarkerTypeChange.bind(this);
    }

    onMarkerTypeChange() {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    }

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
        return this._chart;
    }

    protected _title?: string;
    set title(value: string | undefined) {
        if (this._title !== value) {
            this._title = value;
            this.scheduleLayout();
        }
    }
    get title(): string | undefined {
        return this._title;
    }

    set data(data: any[]) {
        this._data = data;
        this.dirtyDateData = true;
        this.dirtyOpenData = true;
        this.dirtyHighData = true;
        this.dirtyLowData = true;
        this.dirtyCloseData = true;
        this.scheduleData();
    }
    get data(): any[] {
        return this._data;
    }

    protected _dateKey: string = 'date';
    set dateKey(value: string) {
        if (this._dateKey !== value) {
            this._dateKey = value;
            this.dateData = [];
            this.dirtyDateData = true;
            this.scheduleData();
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
            this.scheduleData();
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
            this.scheduleData();
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
            this.scheduleData();
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
            this.scheduleData();
        }
    }
    get closeKey(): string {
        return this._closeKey;
    }

    private _labelKey?: string;
    set labelKey(value: string | undefined) {
        if (this._labelKey !== value) {
            this._labelKey = value;
            this.scheduleData();
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
        const { chart,
            dateKey, openKey, highKey, lowKey, closeKey,
            dirtyDateData, dirtyOpenData, dirtyHighData, dirtyLowData, dirtyCloseData
        } = this;

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(dateKey && openKey && highKey && lowKey && closeKey)) {
            this._data = [];
        }

        if (dirtyDateData) {
            this.domainX = this.calculateDomain(this.dateData = this.data.map(d => d[dateKey]));
            this.dirtyDateData = false;
        }

        if (dirtyOpenData) {
            this.openData = this.data.map(d => d[openKey]);
            this.dirtyOpenData = false;
        }
        if (dirtyHighData) {
            this.highData = this.data.map(d => d[highKey]);
            this.dirtyHighData = false;
        }
        if (dirtyLowData) {
            this.lowData = this.data.map(d => d[lowKey]);
            this.dirtyLowData = false;
        }
        if (dirtyCloseData) {
            this.closeData = this.data.map(d => d[closeKey]);
            this.dirtyCloseData = false;
        }

        if (dirtyOpenData || dirtyHighData || dirtyLowData || dirtyCloseData) {
            const yDomains = new Array<any>().concat(this.openData, this.highData, this.lowData, this.closeData);
            this.domainY = this.calculateDomain(yDomains);
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

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = {
            fill: 'yellow'
        };

    private highlightedNode?: OHLC;

    highlightNode(node: Shape) {
        if (!(node instanceof OHLC)) {
            return;
        }

        this.highlightedNode = node;
        this.scheduleLayout();
    }

    dehighlightNode() {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    }

    update(): void {
        const chart = this.chart;
        const visible = this.group.visible = this.visible;

        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }

        const { xAxis, yAxis } = chart;
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
            highlightedNode
        } = this;

        const Marker = marker.type;

        const groupSelectionData: GroupSelectionDatum[] = dateData.map((dateDatum, i) => {
            const open = openData[i];
            const close = closeData[i];
            const yOpen = yScale.convert(open) + yOffset;
            const yClose = yScale.convert(close) + yOffset;

            return {
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
                node.date = datum.date;
                node.open = datum.open;
                node.high = datum.high;
                node.low = datum.low;
                node.close = datum.close;
                node.width = datum.width;
                node.fill = node === highlightedNode && highlightFill !== undefined ? highlightFill : datum.fill;
                node.stroke = node === highlightedNode && highlightStroke !== undefined ? highlightStroke : datum.stroke;
                node.fillOpacity = marker.fillOpacity;
                node.strokeOpacity = marker.strokeOpacity;
                node.strokeWidth = datum.strokeWidth;
                node.visible = datum.width > 0;
            });

        this.groupSelection = groupSelection;
    }

    getDomainX(): any[] {
        return this.domainX;
    }

    getDomainY(): any[] {
        return this.domainY;
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
            const titleHtml = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
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

            return `${titleHtml}<div class="content">${contentHtml}</div>`;
        }
    }

    tooltipRenderer?: (params: OHLCTooltipRendererParams) => string;

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.dateKey && this.closeKey) {
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.closeKey
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

export class OHLCSeriesMarker {
    onChange?: () => void;
    onTypeChange?: () => void;

    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    private _type: new () => OHLC = Candlestick;
    set type(value: new () => OHLC) {
        if (this._type !== value) {
            this._type = value;
            if (this.onTypeChange) {
                this.onTypeChange();
            }
        }
    }
    get type(): new () => OHLC {
        return this._type;
    }

    protected _upFill: string | undefined = '#33ae5b';
    set upFill(value: string | undefined) {
        if (this._upFill !== value) {
            this._upFill = value;
            this.update();
        }
    }
    get upFill(): string | undefined {
        return this._upFill;
    }

    protected _downFill: string | undefined = '#ff4734';
    set downFill(value: string | undefined) {
        if (this._downFill !== value) {
            this._downFill = value;
            this.update();
        }
    }
    get downFill(): string | undefined {
        return this._downFill;
    }

    protected _noChangeFill: string | undefined = '#b9bdc5';
    set noChangeFill(value: string | undefined) {
        if (this._noChangeFill !== value) {
            this._noChangeFill = value;
            this.update();
        }
    }
    get noChangeFill(): string | undefined {
        return this._noChangeFill;
    }

    private _upStroke: string | undefined = 'black';
    set upStroke(value: string | undefined) {
        if (this._upStroke !== value) {
            this._upStroke = value;
            this.update();
        }
    }
    get upStroke(): string | undefined {
        return this._upStroke;
    }

    protected _downStroke: string | undefined = 'black';
    set downStroke(value: string | undefined) {
        if (this._downStroke !== value) {
            this._downStroke = value;
            this.update();
        }
    }
    get downStroke(): string | undefined {
        return this._downStroke;
    }

    protected _noChangeStroke: string | undefined = 'black';
    set noChangeStroke(value: string | undefined) {
        if (this._noChangeStroke !== value) {
            this._noChangeStroke = value;
            this.update();
        }
    }
    get noChangeStroke(): string | undefined {
        return this._noChangeStroke;
    }

    private _strokeWidth: number = 1;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _fillOpacity: number = 1;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.update();
        }
    }
    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = 1;
    set strokeOpacity(value: number) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.update();
        }
    }
    get strokeOpacity(): number {
        return this._strokeOpacity;
    }

    protected update() {
        if (this.onChange) {
            this.onChange();
        }
    }
}
