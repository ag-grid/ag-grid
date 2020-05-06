import {
    Autowired,
    Component,
    UserComponentFactory,
    IToolPanelComp,
    IToolPanelParams,
    Promise,
    ToolPanelDef,
    PostConstruct,
    GridOptionsWrapper
} from "@ag-grid-community/core";
import { HorizontalResizeComp } from "./horizontalResizeComp";

export class ToolPanelWrapper extends Component {

    @Autowired("userComponentFactory") private userComponentFactory: UserComponentFactory;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        `<div class="ag-tool-panel-wrapper"/>`;

    private toolPanelCompInstance: IToolPanelComp;
    private toolPanelId: string;
    private resizeBar: HorizontalResizeComp;

    constructor() {
        super(ToolPanelWrapper.TEMPLATE);
    }

    public getToolPanelId(): string {
        return this.toolPanelId;
    }

    public setToolPanelDef(toolPanelDef: ToolPanelDef): void {
        this.toolPanelId = toolPanelDef.id;

        const params: IToolPanelParams = {
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };

        const componentPromise: Promise<IToolPanelComp> = this.userComponentFactory.newToolPanelComponent(
            toolPanelDef, params);

        if (componentPromise == null) {
            console.warn(`ag-grid: error processing tool panel component ${toolPanelDef.id}. You need to specify either 'toolPanel' or 'toolPanelFramework'`);
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));
    }

    @PostConstruct
    private setupResize(): void {
        const resizeBar = this.resizeBar = new HorizontalResizeComp();
        this.getContext().wireBean(resizeBar);
        resizeBar.setElementToResize(this.getGui());
        this.appendChild(resizeBar);
    }

    private setToolPanelComponent(compInstance: IToolPanelComp): void {
        this.toolPanelCompInstance = compInstance;

        this.getGui().appendChild(compInstance.getGui());
        this.addDestroyFunc(()=> {
            this.getContext().destroyUserComp(compInstance);
        });
    }

    public getToolPanelInstance(): IToolPanelComp {
        return this.toolPanelCompInstance;
    }

    public setResizerSizerSide(side: 'right' | 'left') {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        const isLeft = side === 'left';
        const inverted = isRtl ? isLeft : !isLeft;

        this.resizeBar.setInverted(inverted);
    }

    public refresh(): void {
        this.toolPanelCompInstance.refresh();
    }

}
