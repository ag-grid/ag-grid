import {Autowired, Component, ComponentResolver, IComponent} from "ag-grid-community";
import {IToolPanelChildComp} from "./toolPanelComp";
import {HorizontalResizeComp} from "./columnsSelect/horizontalResizeComp";

export interface ToolPanelWrapperParams {
    innerComp: IToolPanelChildComp & Component;
}

export class ToolPanelWrapper extends Component implements IComponent<ToolPanelWrapperParams>, IToolPanelChildComp{
    private params: ToolPanelWrapperParams;

    @Autowired("componentResolver") private componentResolver: ComponentResolver;


    private static TEMPLATE =
        `<div class="ag-tool-panel-item-wrapper">
            <!--<ag-horizontal-resize class="ag-tool-panel-horizontal-resize" [component-to-resize]="componentToResize"></ag-horizontal-resize>-->
        </div>`;

    private componentToResize: Component;


    init (params: ToolPanelWrapperParams): void{
        this.params = params;
        this.componentToResize = params.innerComp;
        this.setTemplate(ToolPanelWrapper.TEMPLATE);


        let resizeBar = this.componentResolver.createInternalAgGridComponent(HorizontalResizeComp, {});
        resizeBar.props = {
            componentToResize: this
        };
        resizeBar.addCssClass('ag-tool-panel-horizontal-resize');
        this.getGui().appendChild(resizeBar.getGui());
        this.getGui().appendChild(params.innerComp.getGui());
    }

    refresh(): void {
        this.params.innerComp.refresh();
    }
}