import {
    Autowired,
    Component,
    Events,
    GridOptionsWrapper,
    HorizontalResizeService,
    PostConstruct,
    EventService
} from "ag-grid";

export class HorizontalResizeComp extends Component {

    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;

    private startingWidth: number;

    private props: {
        componentToResize: Component
    };

    constructor() {
        super(`<div></div>`);
    }

    @PostConstruct
    private postConstruct(): void {

        let finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.getGui(),
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizing.bind(this)
        });

        this.addDestroyFunc(finishedWithResizeFunc);
    }

    private onResizeStart(): void {
        this.startingWidth = this.props.componentToResize.getGui().clientWidth;
    }

    private onResizing(delta: number): void {
        let newWidth = this.startingWidth - delta;
        if (newWidth < 100) {
            newWidth = 100;
        }
        this.props.componentToResize.getGui().style.width = newWidth + 'px';
    }
}
