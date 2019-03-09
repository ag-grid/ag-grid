import {
    Autowired,
    Component,
    UserComponentFactory,
    IComponent,
    IToolPanelComp,
    Promise,
    ToolPanelDef,
    PostConstruct
} from "ag-grid-community";
import {IToolPanelChildComp} from "./sideBarComp";
import {HorizontalResizeComp} from "./horizontalResizeComp";

export interface ToolPanelWrapperParams {
    innerComp: IToolPanelChildComp & Component;
}

export class ToolPanelWrapper extends Component implements IComponent<ToolPanelWrapperParams>, IToolPanelChildComp{

    @Autowired("userComponentFactory") private userComponentFactory: UserComponentFactory;

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
        const componentPromise: Promise<IComponent<any>> = this.userComponentFactory.createUserComponent(
            toolPanelDef,
            toolPanelDef.toolPanelParams,
            'toolPanel'
        );
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