import {
    _,
    Autowired,
    Component,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartMenu } from "./menu/chartMenu";

import { Chart } from "ag-charts-community";
import { ChartTranslator } from "./chartTranslator";
import { ChartProxy } from "./chartProxies/chartProxy";

type BBox = { x: number; y: number; width: number; height: number };

export class TitleEdit extends Component {
    private static TEMPLATE =
        `<input
            class="ag-chart-title-edit"
            style="padding:0; border:none; border-radius: 0; min-height: 0; text-align: center;"
        ></input>`;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private chartProxy: ChartProxy<any, any>;

    private destroyChartTitleEditRequestListener: (() => null);

    constructor(private readonly chartMenu: ChartMenu) {
        super(TitleEdit.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addDestroyableEventListener(this.getGui(), 'keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.endEditing();
            }
        });
        this.addDestroyableEventListener(this.getGui(), 'blur', this.endEditing.bind(this));
    }

    /* should be called when the containing component changes to a new chart proxy */
    public setChartProxy(chartProxy: ChartProxy<any, any>) {
        if (this.chartProxy) {
            this.destroyChartTitleEditRequestListener();
            this.destroyChartTitleEditRequestListener = null;
        }

        this.chartProxy = chartProxy;
        const chart = this.chartProxy.getChart() as Chart;
        this.destroyChartTitleEditRequestListener = this.addDestroyableEventListener(chart.scene.canvas.element, 'dblclick', event => {
            const { title } = chart;

            if (title && title.node.isPointInNode(event.offsetX, event.offsetY)) {
                const bbox = title.node.computeBBox();
                const xy = title.node.inverseTransformPoint(bbox.x, bbox.y);

                this.startEditing({ ...bbox, ...xy });
            }
        });
    }

    private startEditing(titleBBox: BBox): void {
        if (this.chartMenu.isVisible()) {
            // currently we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }

        const minimumTargetInputWidth: number = 300;
        const maximumInputWidth: number = this.chartProxy.getChart().width;
        const inputWidth = Math.max(Math.min(titleBBox.width + 20, maximumInputWidth), minimumTargetInputWidth);

        const inputElement = this.getGui() as HTMLInputElement;

        _.addCssClass(inputElement, 'currently-editing');
        const inputStyle = inputElement.style;

        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartProxy.getTitleOption('fontFamily');
        inputStyle.fontWeight = this.chartProxy.getTitleOption('fontWeight');
        inputStyle.fontStyle = this.chartProxy.getTitleOption('fontStyle');
        inputStyle.fontSize = this.chartProxy.getTitleOption('fontSize') + 'px';
        inputStyle.color = this.chartProxy.getTitleOption('color');

        // populate the input with the title, unless the title is the placeholder:
        const oldTitle = this.chartProxy.getTitleOption('text');
        const inputValue = oldTitle === this.chartTranslator.translate('titlePlaceholder') ? '' : oldTitle;
        inputElement.value = inputValue;

        const inputRect = inputElement.getBoundingClientRect();

        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - inputRect.height / 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';

        inputElement.focus();
    }

    private endEditing(): void {
        const value = (this.getGui() as HTMLInputElement).value;

        this.chartProxy.setTitleOption('text', value);

        _.removeCssClass(this.getGui(), 'currently-editing');
    }
}
