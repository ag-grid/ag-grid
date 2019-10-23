import {
    Autowired,
    Component,
    EventService,
    GridOptionsWrapper,
    HorizontalResizeService,
    PostConstruct
} from "@ag-community/grid-core";

export class HorizontalResizeComp extends Component {

    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;

    private startingWidth: number;
    private elementToResize: HTMLElement;
    private inverted: boolean;

    constructor() {
        super(`<div class="ag-tool-panel-horizontal-resize"></div>`);
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
        const newWidth = Math.max(100, Math.floor(this.startingWidth - (delta * direction)));
        this.elementToResize.style.width = `${newWidth}px`;
    }

    public setInverted(inverted: boolean) {
        this.inverted = inverted;
    }
}
