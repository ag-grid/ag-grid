import {
    Autowired,
    Component,
    ComponentResolver,
    IComponent,
    IToolPanelComp,
    Promise,
    ToolPanelDef
} from "ag-grid-community";
import {IToolPanelChildComp} from "./sideBarComp";
import {HorizontalResizeComp} from "./horizontalResizeComp";

export interface ToolPanelWrapperParams {
    innerComp: IToolPanelChildComp & Component;
}

export class ToolPanelWrapper extends Component implements IComponent<ToolPanelWrapperParams>, IToolPanelChildComp{

    @Autowired("componentResolver") private componentResolver: ComponentResolver;

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

    private setToolPanelComponent(compInstance: IToolPanelComp): void {
        this.toolPanelCompInstance = compInstance;
        const resizeBar = this.componentResolver.createInternalAgGridComponent(HorizontalResizeComp, {});
        resizeBar.props = {
            componentToResize: this
        };
        resizeBar.addCssClass('ag-tool-panel-horizontal-resize');
        this.getGui().appendChild(resizeBar.getGui());
        this.getGui().appendChild(compInstance.getGui());

        this.addDestroyFunc( ()=> resizeBar.destroy() );
        this.addDestroyFunc( ()=> {
            if (compInstance.destroy) {
                compInstance.destroy();
            }
        });
    }

    public refresh(): void {
        this.toolPanelCompInstance.refresh();
    }

}