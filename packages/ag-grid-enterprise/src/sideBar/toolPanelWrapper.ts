import {
    Autowired,
    Component,
    ComponentResolver,
    IComponent,
    IToolPanelComp,
    Promise,
    ToolPanelDef,
    Context, PostConstruct
} from "ag-grid-community";
import {IToolPanelChildComp} from "./sideBarComp";
import {HorizontalResizeComp} from "./horizontalResizeComp";

export interface ToolPanelWrapperParams {
    innerComp: IToolPanelChildComp & Component;
}

export class ToolPanelWrapper extends Component implements IComponent<ToolPanelWrapperParams>, IToolPanelChildComp{

    @Autowired("componentResolver") private componentResolver: ComponentResolver;
    @Autowired("context") private context: Context;

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
        const componentPromise: Promise<IComponent<any>> = this.componentResolver.createAgGridComponent(
            toolPanelDef,
            toolPanelDef.toolPanelParams,
            'toolPanel',
            null
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
        this.context.wireBean(resizeBar);
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