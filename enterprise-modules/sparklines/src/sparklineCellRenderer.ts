import {
    Autowired,
    Component,
    ICellRenderer,
    ISparklineCellRendererParams,
    RefSelector,
    ResizeObserverService
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

    constructor() {
        super(SparklineCellRenderer.TEMPLATE);
    }

    public init(params: any): void {
        const { clientWidth, clientHeight } = this.getGui();

        const options = {
            data: params.value,
            width: clientWidth,
            height: clientHeight,
            ...params.sparklineOptions
        }

        this.sparkline = AgSparkline.create(options as any);

        if (this.eSparkline) {
            this.eSparkline.appendChild(this.sparkline.canvasElement);
        }

        const updateSparklineWidthFunc = () => {
            if (this.sparkline) {
                const { clientWidth, clientHeight } = this.getGui();
                this.sparkline.width = clientWidth;
                this.sparkline.height = clientHeight;
            }
        }

        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparklineWidthFunc);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public refresh(params: ISparklineCellRendererParams): boolean {
        if (this.sparkline) {
            const options = {
                data: params.value,
                ...params.sparklineOptions
            }
            AgSparkline.update(this.sparkline, options);
        }
        return true;
    }

    public destroy() {
        console.log("destroy")
        super.destroy();
    }
}
