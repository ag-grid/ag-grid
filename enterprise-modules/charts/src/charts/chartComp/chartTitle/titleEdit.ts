import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartMenu } from "../menu/chartMenu";
import { ChartTranslationService } from "../services/chartTranslationService";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";

interface BBox { x: number; y: number; width: number; height: number }

export class TitleEdit extends Component {
    private static TEMPLATE = /* html */
        `<input
            class="ag-chart-title-edit"
            style="padding:0; border:none; border-radius: 0; min-height: 0; text-align: center;" />
        `;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private destroyableChartListeners: (() => void)[];
    private chartController: ChartController;
    private chartOptionsService: ChartOptionsService;
    private editing: boolean = false;

    constructor(private readonly chartMenu: ChartMenu) {
        super(TitleEdit.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addManagedListener(this.getGui(), 'keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.endEditing();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', () => this.endEditing());
    }

    /* should be called when the containing component changes to a new chart proxy */
    public refreshTitle(chartController: ChartController, chartOptionsService: ChartOptionsService) {
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;

        const chartProxy = this.chartController.getChartProxy();

        if (chartProxy) {
            for (let i = 0; i++; i < this.destroyableChartListeners.length) {
                this.destroyableChartListeners[i]();
            }
            this.destroyableChartListeners = [];
        }

        const chart = chartProxy.getChart();
        const canvas = chart.scene.canvas.element;

        const destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', event => {
            const { title } = chart;

            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                const bbox = title.node.computeBBox()!;
                const xy = title.node.inverseTransformPoint(bbox.x, bbox.y);

                this.startEditing({ ...bbox, ...xy });
            }
        });

        let wasInTitle = false;
        const destroyMouseMoveListener = this.addManagedListener(canvas, 'mousemove', event => {
            const { title } = chart;

            const inTitle = !!(title && title.enabled && title.node.containsPoint(event.offsetX, event.offsetY));

            if (wasInTitle !== inTitle) {
                canvas.style.cursor = inTitle ? 'pointer' : '';
            }

            wasInTitle = inTitle;
        });

        this.destroyableChartListeners = [
            destroyDbleClickListener!,
            destroyMouseMoveListener!
        ];
    }

    private startEditing(titleBBox: BBox): void {
        if (this.chartMenu && this.chartMenu.isVisible()) {
            // currently, we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }

        if (this.editing) {
            return;
        }
        this.editing = true;

        const minimumTargetInputWidth: number = 300;
        const maximumInputWidth: number = this.chartController.getChartProxy().getChart().width;
        const inputWidth = Math.max(Math.min(titleBBox.width + 20, maximumInputWidth), minimumTargetInputWidth);

        const inputElement = this.getGui() as HTMLInputElement;

        inputElement.classList.add('currently-editing');
        const inputStyle = inputElement.style;

        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartOptionsService.getChartOption('title.fontFamily');
        inputStyle.fontWeight = this.chartOptionsService.getChartOption('title.fontWeight');
        inputStyle.fontStyle = this.chartOptionsService.getChartOption('title.fontStyle');
        inputStyle.fontSize = this.chartOptionsService.getChartOption('title.fontSize') + 'px';
        inputStyle.color = this.chartOptionsService.getChartOption('title.color');

        // populate the input with the title, unless the title is the placeholder:
        const oldTitle = this.chartOptionsService.getChartOption('title.text');
        const isTitlePlaceholder = oldTitle === this.chartTranslationService.translate('titlePlaceholder');
        inputElement.value = isTitlePlaceholder ? '' : oldTitle;

        const inputRect = inputElement.getBoundingClientRect();

        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - inputRect.height / 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';

        inputElement.focus();
    }

    private endEditing(): void {
        if (!this.editing) {
            return;
        }
        this.editing = false;

        const value = (this.getGui() as HTMLInputElement).value;
        this.chartOptionsService.setChartOption('title.text', value);
        this.eventService.dispatchEvent({type: 'chartTitleEdit'});
        this.getGui().classList.remove('currently-editing');
    }
}
