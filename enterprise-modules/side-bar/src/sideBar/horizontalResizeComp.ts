import {
    Autowired,
    Component,
    HorizontalResizeService,
    PostConstruct
} from "@ag-grid-community/core";

export class HorizontalResizeComp extends Component {

    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;

    private startingWidth: number;
    private elementToResize: HTMLElement;
    private inverted: boolean;
    private minWidth: number = 100;
    private maxWidth: number | null = null;

    constructor() {
        super(/* html */ `<div class="ag-tool-panel-horizontal-resize"></div>`);
    }

    public setElementToResize(elementToResize: HTMLElement): void {
        this.elementToResize = elementToResize;
    }

    @PostConstruct
    private postConstruct(): void {
        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.getGui(),
            dragStartPixels: 1,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizing.bind(this)
        });

        this.addDestroyFunc(finishedWithResizeFunc);
        this.setInverted(this.gridOptionsWrapper.isEnableRtl());
    }

    private onResizeStart(): void {
        this.startingWidth = this.elementToResize.offsetWidth;
    }

    private onResizing(delta: number): void {
        const direction = this.inverted ? -1 : 1;
        let newWidth = Math.max(this.minWidth, Math.floor(this.startingWidth - (delta * direction)));

        if (this.maxWidth != null) {
            newWidth = Math.min(this.maxWidth, newWidth);
        }
        this.elementToResize.style.width = `${newWidth}px`;
    }

    public setInverted(inverted: boolean) {
        this.inverted = inverted;
    }

    public setMaxWidth(value: number | null) {
        this.maxWidth = value;
    }

    public setMinWidth(value: number | null) {
        if (value != null) {
            this.minWidth = value;
        } else {
            this.minWidth = 100;
        }
    }
}
