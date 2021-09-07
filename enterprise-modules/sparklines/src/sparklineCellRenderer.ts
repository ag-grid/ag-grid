import {
    Autowired,
    Component,
    ICellRenderer,
    ISparklineCellRendererParams,
    RefSelector,
    ResizeObserverService,
    TooltipRendererParams,
    TooltipRendererResult
} from "@ag-grid-community/core";
import { AgSparkline } from "./sparkline/agSparkline";

export class SparklineCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-sparkline-wrapper">
            <span ref="eSparkline"></span>
        </div>`;

    @RefSelector('eSparkline') private eSparkline?: HTMLElement;
    @Autowired('resizeObserverService') private resizeObserverService!: ResizeObserverService;

    private sparkline?: any;
    private params: ISparklineCellRendererParams | undefined;

    constructor() {
        super(SparklineCellRenderer.TEMPLATE);
    }

    public init(params: ISparklineCellRendererParams): void {
        this.params = params;

        const tooltipRenderer = (tooltipRendererParams: TooltipRendererParams): TooltipRendererResult => {
            if (!params.sparklineOptions || !params.sparklineOptions.tooltip || !params.sparklineOptions.tooltip.renderer) {
                return {};
            }
            const renderer = params.sparklineOptions!.tooltip!.renderer;
            tooltipRendererParams.context = {
                data: params.data
            };
            return renderer(tooltipRendererParams);
        }

        let firstTimeIn = true;
        const updateSparkline = () => {
            const { clientWidth, clientHeight } = this.getGui();
            if (clientWidth === 0 || clientHeight === 0) {
                return;
            }

            if (firstTimeIn) {
                // FIXME: temp logging to help troubleshooting
                console.log(tooltipRenderer({} as any));

                const options = {
                    data: params.value,
                    width: clientWidth,
                    height: clientHeight,
                    ...params.sparklineOptions,
                    tooltip: {...params.sparklineOptions!.tooltip, renderer: tooltipRenderer}
                }

                // create new instance of sparkline
                this.sparkline = AgSparkline.create(options);

                // append sparkline canvas element to this.eSparkline;
                this.sparkline.container = this.eSparkline;

                firstTimeIn = false;
            } else {
                this.sparkline.width = clientWidth;
                this.sparkline.height = clientHeight;
            }
        }

        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparkline);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public refresh(params: ISparklineCellRendererParams): boolean {
        this.sparkline.data = params.value;
        return true;
    }

    public destroy() {
        if (this.sparkline) {
            this.sparkline.destroy();
        }
        super.destroy();
    }
}