import type {
    BeanCollection,
    IToolPanelComp,
    IToolPanelParams,
    ToolPanelDef,
    UserComponentFactory,
    WithoutGridCommon,
} from 'ag-grid-community';
import { Component, _warnOnce } from 'ag-grid-community';

import { AgHorizontalResize } from './agHorizontalResize';

export class ToolPanelWrapper extends Component {
    private userComponentFactory: UserComponentFactory;

    public wireBeans(beans: BeanCollection) {
        this.userComponentFactory = beans.userComponentFactory;
    }

    private toolPanelCompInstance: IToolPanelComp | undefined;
    private toolPanelId: string;
    private resizeBar: AgHorizontalResize;
    private width: number | undefined;
    private params: IToolPanelParams;

    constructor() {
        super(/* html */ `<div class="ag-tool-panel-wrapper" role="tabpanel"/>`);
    }

    public postConstruct(): void {
        const eGui = this.getGui();
        const resizeBar = (this.resizeBar = this.createManagedBean(new AgHorizontalResize()));

        eGui.setAttribute('id', `ag-${this.getCompId()}`);

        resizeBar.setElementToResize(eGui);
        this.appendChild(resizeBar);
    }

    public getToolPanelId(): string {
        return this.toolPanelId;
    }

    public setToolPanelDef(toolPanelDef: ToolPanelDef, params: WithoutGridCommon<IToolPanelParams>): void {
        const { id, minWidth, maxWidth, width } = toolPanelDef;

        this.toolPanelId = id;
        this.width = width;

        const compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
        const componentPromise = compDetails.newAgStackInstance();

        this.params = compDetails.params;

        if (componentPromise == null) {
            _warnOnce(`error processing tool panel component ${id}. You need to specify 'toolPanel'`);
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

    public getToolPanelInstance(): IToolPanelComp | undefined {
        return this.toolPanelCompInstance;
    }

    public setResizerSizerSide(side: 'right' | 'left') {
        const isRtl = this.gos.get('enableRtl');
        const isLeft = side === 'left';
        const inverted = isRtl ? isLeft : !isLeft;

        this.resizeBar.setInverted(inverted);
    }

    public refresh(): void {
        this.toolPanelCompInstance?.refresh(this.params);
    }
}
