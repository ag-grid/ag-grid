import {
    Autowired,
    Component,
    UserComponentFactory,
    IToolPanelComp,
    Promise,
    ToolPanelDef,
    PostConstruct,
    GridOptionsWrapper
} from "ag-grid-community";
import { HorizontalResizeComp } from "./horizontalResizeComp";

export class ToolPanelWrapper extends Component {

    @Autowired("userComponentFactory") private userComponentFactory: UserComponentFactory;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        `<div class="ag-tool-panel-wrapper"/>`;

    private toolPanelCompInstance: IToolPanelComp;

    private toolPanelId: string;

    constructor() {
        super(ToolPanelWrapper.TEMPLATE);
    }

    public getToolPanelId(): string {
        return this.toolPanelId;
    }

    public setToolPanelDef(toolPanelDef: ToolPanelDef): void {
        this.toolPanelId = toolPanelDef.id;

        const params: any = {
            api: this.gridOptionsWrapper.getApi()
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
        const resizeBar = new HorizontalResizeComp();
        this.getContext().wireBean(resizeBar);
        resizeBar.setElementToResize(this.getGui());
        this.appendChild(resizeBar);
    }

    private setToolPanelComponent(compInstance: IToolPanelComp): void {
        this.toolPanelCompInstance = compInstance;
        this.appendChild(compInstance);
    }

    public refresh(): void {
        this.toolPanelCompInstance.refresh();
    }

}
