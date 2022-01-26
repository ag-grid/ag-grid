import {
    Autowired,
    Component,
    UserComponentFactory,
    IToolPanelComp,
    IToolPanelParams,
    AgPromise,
    ToolPanelDef,
    PostConstruct
} from "@ag-grid-community/core";
import { HorizontalResizeComp } from "./horizontalResizeComp";

export class ToolPanelWrapper extends Component {

    @Autowired("userComponentFactory") private userComponentFactory: UserComponentFactory;

    private static TEMPLATE = /* html */
        `<div class="ag-tool-panel-wrapper"/>`;

    private toolPanelCompInstance: IToolPanelComp;
    private toolPanelId: string;
    private resizeBar: HorizontalResizeComp;
    private width: number | undefined;

    constructor() {
        super(ToolPanelWrapper.TEMPLATE);
    }

    @PostConstruct
    private setupResize(): void {
        const eGui = this.getGui();
        const resizeBar = this.resizeBar = new HorizontalResizeComp();

        this.getContext().createBean(resizeBar);
        resizeBar.setElementToResize(eGui);
        this.appendChild(resizeBar);
    }

    public getToolPanelId(): string {
        return this.toolPanelId;
    }

    public setToolPanelDef(toolPanelDef: ToolPanelDef): void {
        const { id, minWidth, maxWidth, width } = toolPanelDef;

        this.toolPanelId = id;
        this.width = width;

        const params: IToolPanelParams = {
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!
        };

        const compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
        const componentPromise = compDetails.newAgStackInstance();

        if (componentPromise == null) {
            console.warn(`AG Grid: error processing tool panel component ${id}. You need to specify either 'toolPanel' or 'toolPanelFramework'`);
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));

        if (minWidth != null) {
            this.resizeBar.setMinWidth(minWidth);
        }

        if (maxWidth != null) {
            this.resizeBar.setMaxWidth(maxWidth);
        }
    }

    private setToolPanelComponent(compInstance: IToolPanelComp): void {
        this.toolPanelCompInstance = compInstance;

        this.appendChild(compInstance.getGui());
        this.addDestroyFunc(() => {
            this.destroyBean(compInstance);
        });

        if (this.width) {
            this.getGui().style.width = `${this.width}px`;
        }
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
