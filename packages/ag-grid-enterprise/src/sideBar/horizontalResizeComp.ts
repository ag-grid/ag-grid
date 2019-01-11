import {
    Autowired,
    Component,
    EventService,
    GridOptionsWrapper,
    HorizontalResizeService,
    PostConstruct
} from "ag-grid-community";

export class HorizontalResizeComp extends Component {

    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;

    private startingWidth: number;

    props: {
        componentToResize: Component
    };

    constructor() {
        super(`<div></div>`);
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
    }

    private onResizeStart(): void {
        this.startingWidth = this.props.componentToResize.getGui().offsetWidth;
    }

    private onResizing(delta: number): void {
        const direction = this.gridOptionsWrapper.isEnableRtl() ? -1 : 1;
        const newWidth = Math.max(100, Math.floor(this.startingWidth - (delta * direction)));
        // tslint:disable-next-line
        this.gridOptionsWrapper.isEnableRtl
        this.props.componentToResize.getGui().style.width = `${newWidth}px`;
    }
}
